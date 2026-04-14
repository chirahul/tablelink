"use client";

import { useCallback, useRef } from "react";

export function useAudioAlert(soundUrl: string = "/sounds/new-order.mp3") {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(soundUrl);
    }
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {
      // Browser may block autoplay until user interaction
    });
  }, [soundUrl]);

  return { play };
}
