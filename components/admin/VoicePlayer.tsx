"use client";

import { clsx } from "clsx";
import { useRef, useState } from "react";
import { duration } from "@/components/account/dates";
import { Icon } from "@/components/ui/Icon";
import { Panel } from "@/components/ui/Panel";
import { Text } from "@/components/ui/Text";
import { showToast } from "@/components/ui/toastStore";
import { errorMessage } from "@/lib/api/client";

const BARS = 64;

/** Deterministic waveform from the id (design's seeded bars, swelling in the middle). */
function waveform(seed: string): number[] {
  let h = 0;
  for (const ch of seed) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return Array.from({ length: BARS }, (_, i) => {
    h = (Math.imul(h, 1103515245) + 12345) >>> 0;
    const r = (h >>> 8) / 16777216;
    const envelope = 0.5 + 0.5 * Math.sin(((i + 2) / (BARS + 2)) * Math.PI);
    return Math.round((0.2 + 0.8 * r) * envelope * 100);
  });
}

type VoicePlayerProps = {
  /** Seeds the waveform. */
  id: string;
  seconds: number;
  /** Signed URL for the recording, fetched on first play. */
  loadUrl: () => Promise<string>;
};

/** Voice note player (design): play / pause, waveform progress, click to seek, on an <audio> element. */
export function VoicePlayer({ id, seconds, loadUrl }: VoicePlayerProps) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(0);
  const bars = waveform(id);

  async function toggle() {
    const el = audio.current;
    if (!el) return;
    if (playing) return el.pause();
    try {
      if (!el.src) {
        setLoading(true);
        el.src = await loadUrl();
      }
      await el.play();
    } catch (error) {
      showToast(errorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function seek(to: number) {
    const next = Math.max(0, Math.min(seconds, to));
    setPosition(next);
    if (audio.current?.src) audio.current.currentTime = next;
  }

  return (
    <Panel size="lg" className="flex items-center gap-4 py-4 pr-5 pl-4">
      <audio
        ref={audio}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(event) => setPosition(event.currentTarget.currentTime)}
        onEnded={() => setPosition(seconds)}
      />
      <button
        type="button"
        onClick={toggle}
        disabled={loading}
        aria-label={playing ? "Pause" : "Play"}
        className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-full bg-linear-to-b from-accent-hi to-accent text-paper shadow-key-accent-dialog active:translate-y-0.5"
      >
        <Icon name={playing ? "pause" : "play"} size={16} />
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Position"
          aria-valuemin={0}
          aria-valuemax={seconds}
          aria-valuenow={Math.round(position)}
          aria-valuetext={duration(position)}
          onClick={(event) => {
            const box = event.currentTarget.getBoundingClientRect();
            seek(((event.clientX - box.left) / box.width) * seconds);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") seek(position + 5);
            if (event.key === "ArrowLeft") seek(position - 5);
          }}
          className="flex h-11 cursor-pointer items-center gap-0.5"
        >
          {bars.map((height, i) => (
            <span
              key={i}
              className={clsx("min-w-0 flex-1 rounded-xs", i / BARS < position / (seconds || 1) ? "bg-accent" : "bg-ink/16")}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <Text variant="mono-meta" className="flex justify-between text-muted">
          <span>{duration(position)}</span>
          <span>{duration(seconds)}</span>
        </Text>
      </div>
    </Panel>
  );
}
