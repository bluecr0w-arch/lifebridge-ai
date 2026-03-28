"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Higher-order hook for accessible Text-to-Speech support.
 */
export function useSpeechSynthesis() {
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!synthRef.current) return;
    
    // Stop previous utterance
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.lang = "en-US";
    synthRef.current.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (synthRef.current) synthRef.current.cancel();
  }, []);

  return { speak, stop };
}
