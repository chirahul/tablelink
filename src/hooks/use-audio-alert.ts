"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Plays a synthetic "ding" tone using the Web Audio API.
 * - No binary asset required
 * - Requires user interaction to unlock audio (browser autoplay policy)
 */
export function useAudioAlert() {
  const contextRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(false);

  // Initialise (or resume) the audio context in response to a user gesture.
  const enable = useCallback(async () => {
    if (typeof window === "undefined") return;

    if (!contextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (!AudioContextClass) return;
      contextRef.current = new AudioContextClass();
    }

    if (contextRef.current.state === "suspended") {
      await contextRef.current.resume();
    }

    setEnabled(true);
  }, []);

  const play = useCallback(() => {
    const ctx = contextRef.current;
    if (!ctx || ctx.state !== "running") return;

    const now = ctx.currentTime;

    // Two-tone ding: higher then lower pitch, slight reverb tail.
    const tones = [
      { freq: 988, start: 0, duration: 0.18 }, // B5
      { freq: 659, start: 0.14, duration: 0.28 }, // E5
    ];

    for (const t of tones) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(t.freq, now + t.start);

      gain.gain.setValueAtTime(0, now + t.start);
      gain.gain.linearRampToValueAtTime(0.35, now + t.start + 0.01);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + t.start + t.duration
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t.start);
      osc.stop(now + t.start + t.duration);
    }
  }, []);

  useEffect(() => {
    return () => {
      contextRef.current?.close();
      contextRef.current = null;
    };
  }, []);

  return { enabled, enable, play };
}
