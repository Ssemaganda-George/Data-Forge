# DataForge

**Turn messy files into model-ready datasets.**

DataForge is a SaaS platform where users upload raw, unstructured files — images, PDFs, audio recordings, spreadsheets — and receive back a clean, structured, annotated dataset ready for machine learning. Each file passes through a typed cleaning pipeline (OCR, transcription, deduplication, PII redaction) and the results are packaged with an auto-generated Data Card for full provenance.

---

## Table of contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Project structure](#project-structure)
4. [Data models](#data-models)
5. [Cleaning pipeline](#cleaning-pipeline)
6. [Getting started](#getting-started)
7. [Environment variables](#environment-variables)
8. [Running the app](#running-the-app)
9. [Running the Python service](#running-the-python-service)
10. [Authentication](#authentication)
11. [Storage](#storage)
12. [Job queue](#job-queue)
13. [Switching from temp mode to DB mode](#switching-from-temp-mode-to-db-mode)
14. [Routes reference](#routes-reference)
15. [Tech stack](#tech-stack)

---

## Features

- **Drag-and-drop upload** — drop any file directly onto the dashboard; it is cleaned and annotated in seconds
- **Multi-format support** — images, PDFs, audio/video, CSV/XLSX spreadsheets
- **Per-file cleaning pipeline** — each file type routes to the correct processor (OCR, Whisper transcription, perceptual dedup, schema inference)
- **Confidence scoring** — every output file receives a 0–1 quality score; low-confidence files are flagged for manual review
- **Review dashboard** — accept, reject, or edit flagged files before export
- **Dataset export** — download as CSV, JSON, Parquet, or COCO; format chosen at export time
- **Auto-generated Data Card** — JSON + PDF summary of source files, cleaning actions taken, and quality statistics
- **Usage tracking** — GB-processed metering per user for usage-based billing
- **Two pipeline templates** — "Language & voice studio" (audio/transcription) and "Business data cleaner" (PDF/spreadsheet)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Browser                         │
│   Next.js 14 App Router (React, Tailwind CSS)       │
└────────────────────────┬────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────┐
│              Next.js API routes (Node.js)           │
│  /api/upload  /api/workspace  /api/download         │
│  /api/projects  /api/jobs  /api/export              │
│  /api/auth/[...nextauth]                            │
└──────┬───────────────────────┬───────────────────────┘
       │ Prisma ORM            │ Job queue
       │                       │ (Redis / in-memory)
┌──────▼──────┐      ┌─────────▼──────────────────────┐
│ PostgreSQL  │      │   Python FastAPI service        │
│ (Supabase / │      │   :8001                         │
│  local)     │      │   POST /ocr                     │
└─────────────┘      │   POST /transcribe              │
                     │   POST /clean                   │
                     │   GET  /health                  │
                     └────────────────────────────────┘
                                    │
                     ┌──────────────▼──────────────────┐
                     │  Object storage                 │
                     │  MinIO (local) / S3 (prod)      │
                     └─────────────────────────────────┘
```

### Temp mode vs DB mode

The app ships with two modes toggled by comments in two files:

| Mode | Auth | Upload/storage | When to use |
|---|---|---|---|
| **Temp** (default) | Hardcoded credentials, JWT sessions | In-process memory, no S3 | Testing the UI without any external services |
| **DB** (commented out) | NextAuth + PrismaAdapter, database sessions | PostgreSQL + S3/MinIO + Redis | Production or full-stack integration testing |

See [Switching from temp mode to DB mode](#switching-from-temp-mode-to-db-mode).

---

## Project structure

```
DataForge/
├── prisma/
│   └── schema.prisma           ← All data models
│
├── python-service/
│   ├── main.py                 ← FastAPI service (OCR, transcription, cleaning)
│   └── requirements.txt
│
├── src/
│   ├── app/
│   │   ├── (auth)/             ← Route group: unauthenticated pages
│   │   │   ├── layout.tsx      ← Centered card layout, redirects if already signed in
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   │
│   │   ├── (dashboard)/        ← Route group: auth-gated pages
│   │   │   ├── layout.tsx      ← Sidebar + main area, redirects to /login if no session
│   │   │   ├── page.tsx        ← Dashboard: stat cards, workspace, templates, recent projects
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx            ← Project list
│   │   │   │   ├── new/page.tsx        ← Create project form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        ← Project detail: upload, cleaning options, file list
│   │   │   │       ├── review/page.tsx ← Review flagged files: accept / reject / edit
│   │   │   │       └── export/page.tsx ← Export format selector + Data Card preview
│   │   │   ├── datasets/page.tsx       ← All exported datasets with download links
│   │   │   ├── usage/page.tsx          ← GB-processed chart + quota meter
│   │   │   └── settings/billing/page.tsx ← Plan cards + upgrade flow
│   │   │
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  ← NextAuth handler
│   │   │   ├── upload/route.ts              ← POST file → memory store (temp) or DB+S3 (DB)
│   │   │   ├── workspace/route.ts           ← GET/DELETE session file list (temp mode)
│   │   │   ├── download/route.ts            ← GET dataset as JSON or CSV (temp mode)
│   │   │   ├── projects/route.ts            ← GET list / POST create (DB mode)
│   │   │   ├── jobs/route.ts                ← GET batch/file processing status (DB mode)
│   │   │   ├── export/route.ts              ← POST generate DatasetExport record (DB mode)
│   │   │   └── signout/route.ts             ← POST clear memory store on sign-out
│   │   │
│   │   ├── globals.css          ← Tailwind base + custom component classes
│   │   ├── layout.tsx           ← Root HTML shell + SessionProvider
│   │   └── providers.tsx        ← NextAuth SessionProvider wrapper
│   │
│   ├── components/
│   │   ├── sidebar.tsx          ← Icon + label nav with active link detection
│   │   ├── upload-zone.tsx      ← react-dropzone with per-file progress bars
│   │   ├── workspace-section.tsx ← Live upload + results table + CSV/JSON download
│   │   ├── stat-card.tsx        ← Metric card (label, large number, trend)
│   │   └── ui/
│   │       ├── badge.tsx        ← Status badges: processing / ready / flagged / failed
│   │       ├── button.tsx       ← Button with variants + loading spinner
│   │       ├── card.tsx         ← Card / CardHeader / CardTitle
│   │       └── input.tsx        ← Input + Textarea with label and error state
│   │
│   ├── lib/
│   │   ├── auth.ts              ← NextAuth config (temp: credentials; DB: PrismaAdapter)
│   │   ├── db.ts                ← Prisma client singleton
│   │   ├── utils.ts             ← cn(), formatBytes(), formatNumber()
│   │   ├── storage.ts           ← StorageAdapter interface + LocalDisk impl
│   │   ├── queue.ts             ← QueueAdapter interface + InMemory + Redis impls
│   │   ├── memory-store.ts      ← In-process file store for temp mode
│   │   ├── data-card.ts         ← DataCard JSON generator from cleaning results
│   │   └── pipeline/
│   │       ├── index.ts         ← CleaningPipeline interface + registry
│   │       ├── image-deduper.ts
│   │       ├── pdf-ocr-cleaner.ts
│   │       ├── audio-transcriber.ts
│   │       └── spreadsheet-cleaner.ts
│   │
│   └── types/
│       ├── next-auth.d.ts       ← Augments Session with user.id
│       └── css.d.ts             ← Declares *.css module for TypeScript
│
├── .env.example                 ← Template — copy to .env.local
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── prisma/schema.prisma
```

---

## Data models

Defined in `prisma/schema.prisma`.

| Model | Key fields | Notes |
|---|---|---|
| `User` | id, email, name, createdAt | NextAuth-compatible; owns Projects and UsageLogs |
| `Account` / `Session` / `VerificationToken` | — | Standard NextAuth adapter tables |
| `Project` | id, userId, name, module | `module` is `LANGUAGE_VOICE \| BUSINESS_DATA \| GENERAL` |
| `UploadBatch` | id, projectId, status | `status`: `PENDING → PROCESSING → REVIEW → COMPLETE \| FAILED` |
| `FileRecord` | id, batchId, originalName, fileType, storageUrl, status, cleaningActions (JSON), confidenceScore, flaggedForReview | One row per uploaded file |
| `DatasetExport` | id, batchId, format, downloadUrl, dataCardUrl | `format`: `CSV \| JSON \| PARQUET \| COCO` |
| `UsageLog` | id, userId, gbProcessed, fileCount | Append-only; summed for billing |

---

## Cleaning pipeline

Each uploaded file is routed to the appropriate pipeline based on MIME type:

| File type | Pipeline | Actions |
|---|---|---|
| `image/*` | `ImageDeduper` | Perceptual hash dedup, EXIF strip |
| `application/pdf` | `PdfOcrCleaner` | OCR text extraction, PII redaction, language detection |
| `audio/*`, `video/*` | `AudioTranscriber` | Whisper transcription, language detection, speaker diarisation |
| `text/csv`, `*excel*`, `*spreadsheet*` | `SpreadsheetCleaner` | Null removal, schema inference, row deduplication |

All four are currently **stub implementations** that return realistic placeholder results. Replace the body of each `process()` method — or the corresponding FastAPI endpoint — to wire up real ML logic without changing any callers.

The interface contract is:

```typescript
interface CleaningPipeline {
  accepts(fileType: string): boolean;
  process(file: FileRecord): Promise<CleaningResult>;
}

interface CleaningResult {
  fileRecordId: string;
  cleaningActions: CleaningAction[];   // array of { type, description, appliedAt }
  confidenceScore: number;             // 0.0 – 1.0
  flaggedForReview: boolean;
  outputUrl?: string;
  metadata?: Record<string, unknown>;
}
```

---

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+
- Python 3.10+ (for the processing service)
- PostgreSQL (local, Docker, or Supabase) — **only needed for DB mode**
- Redis — **only needed for DB mode**

### 1. Clone and install

```bash
git clone <repo-url>
cd DataForge
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your values. The minimum required for **temp mode** (no DB) is:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=any-random-string-here
```

### 3. Generate Prisma client

Even in temp mode the Prisma client must be generated (type definitions are used across the codebase):

```bash
npm run db:generate
```

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_URL` | Yes | Full URL of the app, e.g. `http://localhost:3000` |
| `NEXTAUTH_SECRET` | Yes | Random string for signing JWTs/cookies |
| `DATABASE_URL` | DB mode | PostgreSQL connection string. Special chars in password must be URL-encoded (`@` → `%40`) |
| `GOOGLE_CLIENT_ID` | Optional | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | Google OAuth client secret |
| `EMAIL_SERVER` | DB mode | SMTP URL for magic-link emails, e.g. `smtp://localhost:1025` |
| `EMAIL_FROM` | DB mode | From address for auth emails |
| `REDIS_URL` | DB mode | Redis connection URL, e.g. `redis://localhost:6379` |
| `STORAGE_ENDPOINT` | DB mode | S3/MinIO endpoint URL |
| `STORAGE_ACCESS_KEY` | DB mode | S3/MinIO access key |
| `STORAGE_SECRET_KEY` | DB mode | S3/MinIO secret key |
| `STORAGE_BUCKET` | DB mode | Bucket name |
| `STORAGE_REGION` | DB mode | AWS region or `us-east-1` for MinIO |

---

## Running the app

```bash
# Development (hot reload)
npm run dev

# Production build
npm run build
npm start

# Type check only
npx tsc --noEmit

# Lint
npm run lint
```

---

## Running the Python service

The FastAPI service handles OCR, audio transcription, and spreadsheet cleaning. In temp mode the Node.js pipeline stubs run inline, but once you wire up real ML logic you will call this service from the queue worker.

```bash
cd python-service

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service (port 8001)
uvicorn main:app --reload --port 8001
```

**Endpoints:**

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe — returns `{"status":"ok"}` |
| `POST` | `/ocr` | Extract text from a PDF |
| `POST` | `/transcribe` | Transcribe audio/video to text |
| `POST` | `/clean` | Clean a CSV/XLSX spreadsheet |

**Request body (all POST endpoints):**

```json
{
  "file_record_id": "string",
  "storage_url": "https://...",
  "options": {}
}
```

To add real ML logic, install the commented-out packages in `requirements.txt` (`openai-whisper`, `pytesseract`, `pandas`, etc.) and replace the stub return values in `main.py`.

---

## Authentication

### Temp mode (default)

A single hardcoded user is accepted by a `CredentialsProvider`. Sessions are stored in a signed JWT cookie — no database required.

| Field | Value |
|---|---|
| Email | `ssgeorge480@gmail.com` |
| Password | _(set in `src/lib/auth.ts` `DEV_PASSWORD`)_ |

### DB mode

NextAuth.js with:
- **Email provider** — magic-link sign-in via SMTP
- **Google OAuth** — one-click sign-in (requires `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`)
- **PrismaAdapter** — sessions persisted to PostgreSQL
- **Session strategy** — `database`

To enable Google OAuth, create credentials at [console.cloud.google.com](https://console.cloud.google.com) and add `http://localhost:3000/api/auth/callback/google` as an authorised redirect URI.

---

## Storage

The `StorageAdapter` interface in `src/lib/storage.ts` abstracts file I/O:

```typescript
interface StorageAdapter {
  upload(key: string, buffer: Buffer, contentType: string): Promise<{ url, key }>;
  getSignedUrl(key: string, expiresIn?: number): Promise<string>;
  delete(key: string): Promise<void>;
}
```

**Local dev** — `LocalStorageAdapter` writes to `./uploads/` on disk and serves files at `/api/files/<key>`.

**Production** — swap in an `S3Adapter` (uncomment or implement in `storage.ts`). Set the `STORAGE_*` environment variables to point at AWS S3 or a MinIO instance.

To run MinIO locally with Docker:

```bash
docker run -d --name dataforge-minio \
  -e MINIO_ROOT_USER=minioadmin \
  -e MINIO_ROOT_PASSWORD=minioadmin \
  -p 9000:9000 -p 9001:9001 \
  quay.io/minio/minio server /data --console-address ":9001"
```

Admin UI is at [http://localhost:9001](http://localhost:9001).

---

## Job queue

`src/lib/queue.ts` defines a `QueueAdapter` interface so the underlying transport can be swapped without changing callers:

```typescript
interface QueueAdapter {
  enqueue(payload: JobPayload): Promise<void>;
  dequeue(): Promise<JobPayload | null>;
  publishResult(result: JobResult): Promise<void>;
}
```

| Environment | Adapter used |
|---|---|
| `REDIS_URL` not set | `InMemoryQueueAdapter` (Array-backed, no persistence) |
| `REDIS_URL` set | `RedisQueueAdapter` (RPUSH/LPOP + Pub/Sub for results) |
| Production at scale | Replace with `SQSAdapter` (implement the same interface against `@aws-sdk/client-sqs`) |

---

## Switching from temp mode to DB mode

When your database is confirmed reachable (`npm run db:push` succeeds):

### 1. Database setup

```bash
# Create .env with your real DATABASE_URL (Prisma reads .env, not .env.local)
echo 'DATABASE_URL="postgresql://user:password@host:5432/dataforge"' > .env

npm run db:push        # Push schema to DB
# or for versioned migrations:
npm run db:migrate
```

### 2. Auth — `src/lib/auth.ts`

- Delete the `── TEMP MODE ──` block
- Uncomment the `── DB MODE ──` block
- Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `EMAIL_SERVER`, `EMAIL_FROM` in `.env.local`

### 3. Upload — `src/app/api/upload/route.ts`

- Delete the `── TEMP MODE ──` block
- Uncomment the `── DB MODE ──` block
- Ensure `REDIS_URL` and `STORAGE_*` vars are set

### 4. Dashboard — `src/app/(dashboard)/page.tsx`

- Uncomment `import { db } from "@/lib/db"`
- Replace `PLACEHOLDER_STATS` with the real `db.*` aggregate queries shown in the comments

### 5. Login page — `src/app/(auth)/login/page.tsx`

Optionally restore the Google + magic-link UI (replace the credentials form with the original providers).

---

## Routes reference

| Route | Description |
|---|---|
| `/login` | Sign in (credentials in temp mode; email + Google in DB mode) |
| `/signup` | Create account |
| `/` | Dashboard — stat cards, drag-and-drop workspace, template cards, recent projects |
| `/projects` | Project list |
| `/projects/new` | Create project with pipeline type selector |
| `/projects/[id]` | Project detail — file upload, cleaning option toggles, file list |
| `/projects/[id]/review` | Review flagged files — accept / reject / edit per file |
| `/projects/[id]/export` | Format selector + Data Card preview + download |
| `/datasets` | All exported datasets with download links |
| `/usage` | Monthly GB chart + quota meter |
| `/settings/billing` | Plan cards + upgrade flow |

**API routes:**

| Method | Path | Mode | Description |
|---|---|---|---|
| `POST` | `/api/upload` | Both | Upload and clean a single file |
| `GET` | `/api/workspace` | Temp | List all files in the current session |
| `DELETE` | `/api/workspace` | Temp | Clear all files in the current session |
| `GET` | `/api/download?format=json\|csv` | Temp | Download cleaned dataset |
| `GET` | `/api/projects` | DB | List user's projects |
| `POST` | `/api/projects` | DB | Create a project |
| `GET` | `/api/jobs?batchId=` | DB | Poll batch processing status |
| `POST` | `/api/export` | DB | Generate DatasetExport + Data Card |
| `GET` | `/api/keys` | DB | List your API keys (session only) |
| `POST` | `/api/keys` | DB | Create an API key (session only, plaintext shown once) |
| `DELETE` | `/api/keys/[id]` | DB | Revoke an API key (session only) |
| `POST` | `/api/signout` | Both | Clear memory store, then NextAuth signs out |

---

## API access & MCP

`/api/upload`, `/api/projects`, `/api/jobs`, `/api/export`, and `/api/download`
all accept an API key instead of a browser session — send it as
`Authorization: Bearer dfk_...`. Create a key under **Settings → API Keys**.

### From Kaggle / Google Colab (or any Python script)

Notebooks don't speak MCP — call the REST API directly:

```python
import requests

API_KEY = "dfk_..."
BASE = "https://data-forge-jet.vercel.app"
headers = {"Authorization": f"Bearer {API_KEY}"}

projects = requests.get(f"{BASE}/api/projects", headers=headers).json()

with open("scan.pdf", "rb") as f:
    requests.post(f"{BASE}/api/upload", headers=headers, files={"file": f})

zip_bytes = requests.get(f"{BASE}/api/download", headers=headers).content
open("dataset.zip", "wb").write(zip_bytes)
```

### From an MCP client (Claude Desktop, Claude Code, Cursor)

MCP is for AI agents/IDEs, not notebooks. `mcp-server/server.mjs` wraps the
same REST API as MCP tools (`list_projects`, `create_project`, `get_batch`,
`export_dataset`, `download_dataset`). Point your MCP client config at it:

```json
{
  "mcpServers": {
    "dataforge": {
      "command": "node",
      "args": ["mcp-server/server.mjs"],
      "env": {
        "DATAFORGE_API_KEY": "dfk_...",
        "DATAFORGE_BASE_URL": "https://data-forge-jet.vercel.app"
      }
    }
  }
}
```

Or run it standalone: `npm run mcp`.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Icons | @tabler/icons-react |
| Auth | NextAuth.js v4 |
| ORM | Prisma 5 |
| Database | PostgreSQL (Supabase / local) |
| Queue | Redis (ioredis) / In-memory |
| Storage | S3-compatible (MinIO / AWS S3) / Local disk |
| Processing service | Python 3 + FastAPI |
| ML (planned) | OpenAI Whisper, Tesseract OCR, pandas |
| Validation | Zod |
| File upload | react-dropzone |
