const SUNBIRD_BASE = "https://api.sunbird.ai";

function mimeToAudioExt(mimeType: string): string {
  const map: Record<string, string> = {
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/mp4": "m4a",
    "audio/wav": "wav",
    "audio/wave": "wav",
    "audio/x-wav": "wav",
    "audio/ogg": "ogg",
    "audio/flac": "flac",
    "audio/webm": "webm",
    "video/mp4": "mp4",
    "video/webm": "webm",
    "video/quicktime": "mov",
  };
  return map[mimeType] ?? "mp3";
}

function getApiKey(): string {
  const key = process.env.SUNBIRD_API_KEY;
  if (!key) throw new Error("SUNBIRD_API_KEY not configured");
  return key;
}

export async function sunbirdTranscribe(
  buffer: Buffer,
  mimeType: string,
  language: string
): Promise<{ transcription: string; language: string }> {
  const ext = mimeToAudioExt(mimeType);
  const form = new FormData();
  form.append(
    "audio",
    new Blob([buffer as unknown as ArrayBuffer], { type: mimeType }),
    `audio.${ext}`
  );
  form.append("language", language);
  form.append("platform", "modal");

  const res = await fetch(`${SUNBIRD_BASE}/tasks/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getApiKey()}` },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Sunbird STT ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    audio_transcription?: string;
    language?: string;
  };

  return {
    transcription: (json.audio_transcription ?? "").trim(),
    language: json.language ?? language,
  };
}

export async function sunbirdTranslate(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<{
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
}> {
  const res = await fetch(`${SUNBIRD_BASE}/tasks/translate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      text,
      source_language: sourceLanguage,
      target_language: targetLanguage,
    }),
  });

  if (!res.ok) {
    throw new Error(`Sunbird translate ${res.status}: ${await res.text()}`);
  }

  const json = (await res.json()) as {
    output?: {
      translated_text?: string;
      source_language?: string;
      target_language?: string;
    };
  };

  return {
    translatedText: (json.output?.translated_text ?? "").trim(),
    sourceLanguage: json.output?.source_language ?? sourceLanguage,
    targetLanguage: json.output?.target_language ?? targetLanguage,
  };
}

export function isSunbirdConfigured(): boolean {
  return Boolean(process.env.SUNBIRD_API_KEY);
}
