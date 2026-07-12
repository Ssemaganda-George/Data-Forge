/**
 * Storage abstraction — swap the implementation without touching callers.
 * Local dev: writes to ./uploads on disk.
 * Production: swap to an S3/MinIO client.
 */

import { writeFile, mkdir } from "fs/promises";
import path from "path";

export interface StorageUploadResult {
  url: string;
  key: string;
}

export interface StorageAdapter {
  upload(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<StorageUploadResult>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}

// ─── Local disk adapter (dev) ─────────────────────────────────────────────────

class LocalStorageAdapter implements StorageAdapter {
  private base: string;

  constructor() {
    this.base = path.join(process.cwd(), "uploads");
  }

  async upload(
    key: string,
    buffer: Buffer,
    _contentType: string
  ): Promise<StorageUploadResult> {
    const fullPath = path.join(this.base, key);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    const url = `/api/files/${encodeURIComponent(key)}`;
    return { url, key };
  }

  async getSignedUrl(key: string): Promise<string> {
    return `/api/files/${encodeURIComponent(key)}`;
  }

  async delete(_key: string): Promise<void> {
    // no-op in local dev
  }
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _storage: StorageAdapter | null = null;

export function getStorage(): StorageAdapter {
  if (!_storage) {
    // TODO: replace with S3Adapter when STORAGE_ENDPOINT is set in production
    _storage = new LocalStorageAdapter();
  }
  return _storage;
}
