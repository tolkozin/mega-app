"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function getSpeechRecognition(): (new () => any) | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
}

export function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<ReturnType<typeof setInterval>>(null);

  useEffect(() => {
    setSupported(!!getSpeechRecognition());
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsListening(false);
    setSeconds(0);
  }, []);

  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) {
        onTranscript(last[0].transcript.trim());
      }
    };

    recognition.onerror = () => stop();
    recognition.onend = () => stop();

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setSeconds(0);

    timerRef.current = setInterval(() => {
      setSeconds((s: number) => {
        if (s >= 119) {
          stop();
          return 0;
        }
        return s + 1;
      });
    }, 1000);
  }, [onTranscript, stop]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!supported) {
    return (
      <button
        disabled
        title="Voice input not supported in this browser"
        className="w-8 h-8 rounded-full flex items-center justify-center text-[#C4C4D4] cursor-not-allowed"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1a2 2 0 012 2v4a2 2 0 11-4 0V3a2 2 0 012-2z" />
          <path d="M4 7a4 4 0 008 0" />
          <path d="M8 13v2M2 2l12 12" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={isListening ? stop : start}
      disabled={disabled}
      title={isListening ? `Recording... ${seconds}s / 120s` : "Voice input"}
      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
        isListening
          ? "bg-red-500 text-white animate-pulse"
          : "text-[#8181A5] hover:text-[#5E81F4] hover:bg-[#F0F0F5]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 1a2 2 0 012 2v4a2 2 0 11-4 0V3a2 2 0 012-2z" />
        <path d="M4 7a4 4 0 008 0" />
        <path d="M8 13v2" />
      </svg>
    </button>
  );
}
