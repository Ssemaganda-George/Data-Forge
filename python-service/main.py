"""
DataForge Python processing service.

Provides:
  POST /ocr          — PDF text extraction (Tesseract / AWS Textract)
  POST /transcribe   — Audio transcription (Whisper)
  POST /clean        — Spreadsheet cleaning (pandas)
  GET  /health       — Liveness probe

All endpoints accept a JSON body with `storage_url` and return a
`CleaningResult` that the Node.js backend merges into the FileRecord.
"""

from __future__ import annotations

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Any, Optional
import datetime

app = FastAPI(title="DataForge Processing Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Shared types ─────────────────────────────────────────────────────────────


class CleaningAction(BaseModel):
    type: str
    description: str
    applied_at: str = datetime.datetime.utcnow().isoformat()


class CleaningResult(BaseModel):
    file_record_id: str
    cleaning_actions: list[CleaningAction]
    confidence_score: float
    flagged_for_review: bool
    output_url: Optional[str] = None
    metadata: dict[str, Any] = {}


class ProcessRequest(BaseModel):
    file_record_id: str
    storage_url: str
    options: dict[str, Any] = {}


# ─── Health ────────────────────────────────────────────────────────────────────


@app.get("/health")
def health():
    return {"status": "ok"}


# ─── OCR ──────────────────────────────────────────────────────────────────────


@app.post("/ocr", response_model=CleaningResult)
async def ocr_pdf(req: ProcessRequest) -> CleaningResult:
    """
    Stub: extract text from a PDF.
    TODO: download file from storage_url, run Tesseract/Textract, return text.
    """
    now = datetime.datetime.utcnow().isoformat()
    return CleaningResult(
        file_record_id=req.file_record_id,
        cleaning_actions=[
            CleaningAction(
                type="OCR_EXTRACTION",
                description="Text extracted from PDF (stub)",
                applied_at=now,
            ),
            CleaningAction(
                type="PII_REDACTION",
                description="PII scan completed — 0 items redacted (stub)",
                applied_at=now,
            ),
            CleaningAction(
                type="LANGUAGE_DETECT",
                description="Language detected: en (stub)",
                applied_at=now,
            ),
        ],
        confidence_score=0.88,
        flagged_for_review=False,
        metadata={"page_count": 1, "language": "en"},
    )


# ─── Transcription ────────────────────────────────────────────────────────────


@app.post("/transcribe", response_model=CleaningResult)
async def transcribe_audio(req: ProcessRequest) -> CleaningResult:
    """
    Stub: transcribe audio using Whisper.
    TODO: download file, run openai-whisper or faster-whisper, return transcript.
    """
    now = datetime.datetime.utcnow().isoformat()
    return CleaningResult(
        file_record_id=req.file_record_id,
        cleaning_actions=[
            CleaningAction(
                type="AUDIO_TRANSCRIPTION",
                description="Audio transcribed to text (stub)",
                applied_at=now,
            ),
            CleaningAction(
                type="LANGUAGE_DETECT",
                description="Language detected: en (stub)",
                applied_at=now,
            ),
            CleaningAction(
                type="SPEAKER_DIARIZE",
                description="2 speakers identified (stub)",
                applied_at=now,
            ),
        ],
        confidence_score=0.82,
        flagged_for_review=False,
        metadata={"duration_seconds": 0, "language": "en", "speaker_count": 2},
    )


# ─── Spreadsheet cleaning ─────────────────────────────────────────────────────


@app.post("/clean", response_model=CleaningResult)
async def clean_spreadsheet(req: ProcessRequest) -> CleaningResult:
    """
    Stub: clean a CSV/XLSX file.
    TODO: download file, use pandas to remove nulls/dupes, infer schema, return.
    """
    now = datetime.datetime.utcnow().isoformat()
    return CleaningResult(
        file_record_id=req.file_record_id,
        cleaning_actions=[
            CleaningAction(
                type="NULL_REMOVAL",
                description="Empty rows and columns removed (stub)",
                applied_at=now,
            ),
            CleaningAction(
                type="SCHEMA_INFER",
                description="Column types inferred from data (stub)",
                applied_at=now,
            ),
            CleaningAction(
                type="DEDUP_ROWS",
                description="Duplicate rows removed (stub)",
                applied_at=now,
            ),
        ],
        confidence_score=0.91,
        flagged_for_review=False,
        metadata={"row_count": 0, "column_count": 0},
    )
