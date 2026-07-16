"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { IconMicrophone, IconSquare, IconTrash } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  disabled?: boolean;
  onRecordingComplete: (file: File) => void;
}

export function AudioRecorder({
  disabled,
  onRecordingComplete,
}: AudioRecorderProps) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setSupported(false);
    }
    return () => stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  async function start() {
    setError("");
    if (disabled) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg")
        ? "audio/ogg"
        : "";

      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined
      );
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type });
        const ext = type.includes("ogg") ? "ogg" : "webm";
        const name = `recording-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
        onRecordingComplete(new File([blob], name, { type }));
      };

      recorder.start();
      setRecording(true);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } catch {
      setError("Microphone access was denied or is unavailable.");
    }
  }

  function toggle() {
    if (recording) {
      stop();
      setRecording(false);
    } else {
      void start();
    }
  }

  const seconds = String(Math.floor(elapsed % 60)).padStart(2, "0");
  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");

  if (!supported) {
    return (
      <p className="text-xs text-gray-400">
        Audio recording isn&apos;t supported in this browser. Upload an audio file instead.
      </p>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled}
        className={cn(
          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          recording
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-brand-500 text-white hover:bg-brand-600"
        )}
      >
        {recording ? <IconSquare size={16} /> : <IconMicrophone size={16} />}
        {recording ? "Stop" : "Record audio"}
      </button>

      {recording && (
        <span className="flex items-center gap-1.5 text-sm text-gray-700 tabular-nums">
          <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
          {minutes}:{seconds}
        </span>
      )}

      {!recording && elapsed > 0 && (
        <button
          type="button"
          onClick={() => setElapsed(0)}
          className="text-gray-400 hover:text-gray-600"
          title="Discard recording"
        >
          <IconTrash size={15} />
        </button>
      )}

      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
