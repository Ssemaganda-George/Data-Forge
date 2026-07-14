/**
 * Job queue abstraction.
 *
 * In local dev: uses an in-memory list + Redis pub/sub.
 * Structured so the enqueue/dequeue interface can be swapped for AWS SQS
 * without changing callers — just replace the adapter behind the factory.
 */

export interface JobPayload {
  jobId: string;
  fileRecordId: string;
  batchId: string;
  fileType: string;
  storageUrl: string;
}

export interface JobResult {
  jobId: string;
  fileRecordId: string;
  cleaningActions: Record<string, unknown>;
  confidenceScore: number;
  flaggedForReview: boolean;
}

export interface QueueAdapter {
  enqueue(payload: JobPayload): Promise<void>;
  dequeue(): Promise<JobPayload | null>;
  publishResult(result: JobResult): Promise<void>;
}

// ─── In-memory stub (works without Redis running) ─────────────────────────────

class InMemoryQueueAdapter implements QueueAdapter {
  private queue: JobPayload[] = [];

  async enqueue(payload: JobPayload): Promise<void> {
    this.queue.push(payload);
    console.log(`[queue] enqueued job ${payload.jobId}`);
  }

  async dequeue(): Promise<JobPayload | null> {
    return this.queue.shift() ?? null;
  }

  async publishResult(result: JobResult): Promise<void> {
    console.log(`[queue] result for job ${result.jobId}`, result);
  }
}

// ─── Redis adapter ────────────────────────────────────────────────────────────

class RedisQueueAdapter implements QueueAdapter {
  private static QUEUE_KEY = "yodataset:jobs";
  private client: import("ioredis").Redis | null = null;

  private async getClient() {
    if (!this.client) {
      const { default: Redis } = await import("ioredis");
      this.client = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379");
    }
    return this.client;
  }

  async enqueue(payload: JobPayload): Promise<void> {
    const client = await this.getClient();
    await client.rpush(
      RedisQueueAdapter.QUEUE_KEY,
      JSON.stringify(payload)
    );
  }

  async dequeue(): Promise<JobPayload | null> {
    const client = await this.getClient();
    const raw = await client.lpop(RedisQueueAdapter.QUEUE_KEY);
    return raw ? (JSON.parse(raw) as JobPayload) : null;
  }

  async publishResult(result: JobResult): Promise<void> {
    const client = await this.getClient();
    await client.publish(
      `yodataset:results:${result.fileRecordId}`,
      JSON.stringify(result)
    );
  }
}

// ─── Singleton factory ────────────────────────────────────────────────────────

let _queue: QueueAdapter | null = null;

export function getQueue(): QueueAdapter {
  if (!_queue) {
    _queue =
      process.env.REDIS_URL
        ? new RedisQueueAdapter()
        : new InMemoryQueueAdapter();
  }
  return _queue;
}
