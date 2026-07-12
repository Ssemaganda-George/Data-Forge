# Python service

A FastAPI service that handles the ML/processing workloads for DataForge.

## Setup

```bash
cd python-service
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
uvicorn main:app --reload --port 8001
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Liveness probe |
| POST | /ocr | PDF text extraction (stub → Tesseract/Textract) |
| POST | /transcribe | Audio transcription (stub → Whisper) |
| POST | /clean | Spreadsheet cleaning (stub → pandas) |

## Request body (all POST endpoints)

```json
{
  "file_record_id": "string",
  "storage_url": "string",
  "options": {}
}
```
