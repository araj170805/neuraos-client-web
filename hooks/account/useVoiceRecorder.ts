"use client";

import { useEffect, useRef, useState } from "react";
import { ALLOWED_AUDIO_MIME } from "@/lib/contracts/contributions";
import { MAX_VOICE_SECONDS } from "@/lib/limits";

export type RecorderStatus = "idle" | "recording" | "stopped";

export type Recording = { audio: Blob; durationSec: number };

export type VoiceRecorder = {
  status: RecorderStatus;
  seconds: number;
  /** Set once recording stops. */
  recording: Recording | null;
  /** Microphone blocked or unsupported, in plain words. */
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
  reset: () => void;
};

function pickMimeType(): string | undefined {
  return ALLOWED_AUDIO_MIME.find((type) => MediaRecorder.isTypeSupported(type));
}

/** MediaRecorder for "Talk it through": records up to MAX_VOICE_SECONDS, then stops on its own. */
export function useVoiceRecorder(): VoiceRecorder {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [seconds, setSeconds] = useState(0);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function release() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    recorder.current?.stream.getTracks().forEach((track) => track.stop());
  }

  useEffect(() => {
    return () => {
      if (recorder.current?.state === "recording") recorder.current.stop();
      release();
    };
  }, []);

  function stop() {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }

  async function start() {
    setError(null);
    if (typeof MediaRecorder === "undefined" || !navigator.mediaDevices) {
      setError("This browser can't record audio. Try Chrome, Edge or Safari.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError("Allow microphone access to record.");
      return;
    }

    const mimeType = pickMimeType();
    const media = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    const startedAt = Date.now();
    media.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };
    media.onstop = () => {
      release();
      const durationSec = Math.min((Date.now() - startedAt) / 1000, MAX_VOICE_SECONDS);
      setRecording({ audio: new Blob(chunks, { type: media.mimeType.split(";")[0] }), durationSec });
      setStatus("stopped");
    };

    recorder.current = media;
    media.start(1000);
    setSeconds(0);
    setRecording(null);
    setStatus("recording");
    timer.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt) / 1000);
      setSeconds(Math.min(elapsed, MAX_VOICE_SECONDS));
      if (elapsed >= MAX_VOICE_SECONDS) stop();
    }, 250);
  }

  function reset() {
    // Discard: stop without producing a recording.
    if (recorder.current) recorder.current.onstop = release;
    stop();
    setStatus("idle");
    setSeconds(0);
    setRecording(null);
    setError(null);
  }

  return { status, seconds, recording, error, start, stop, reset };
}
