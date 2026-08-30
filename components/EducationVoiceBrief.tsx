"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DAILY_AUDIO_PUBLIC_PATH,
} from "@/lib/dailyAudio";
import { splitSpeechChunks } from "@/lib/articleAudio";
import {
  VOICE_BRIEF_EVENT,
  buildEducationVoiceScript,
  type VoiceBriefStory,
} from "@/lib/educationVoiceBrief";

type VoiceState = "idle" | "speaking" | "paused";

export default function EducationVoiceBrief() {
  const [stories, setStories] = useState<VoiceBriefStory[]>([]);
  const [listenIntro, setListenIntro] = useState("");
  const script = useMemo(
    () => buildEducationVoiceScript(stories, { listenIntro }),
    [stories, listenIntro],
  );
  const [state, setState] = useState<VoiceState>("idle");
  const [supported, setSupported] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [liveLine, setLiveLine] = useState("");

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const playTokenRef = useRef(0);
  const chunkIndexRef = useRef(0);
  const chunksRef = useRef<string[]>([]);

  const chunks = useMemo(() => splitSpeechChunks(script), [script]);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/education-brief")
      .then((response) => response.json())
      .then((data: { stories?: VoiceBriefStory[]; listenIntro?: string; script?: string }) => {
        if (!cancelled && Array.isArray(data.stories)) setStories(data.stories);
        if (!cancelled && typeof data.listenIntro === "string") setListenIntro(data.listenIntro);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    playTokenRef.current += 1;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    chunkIndexRef.current = 0;
    chunksRef.current = [];
    setLiveLine("");
    setState("idle");
  }, []);

  const startSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    window.speechSynthesis.cancel();

    const token = playTokenRef.current + 1;
    playTokenRef.current = token;
    chunksRef.current = chunks;
    chunkIndexRef.current = 0;

    if (!chunksRef.current.length) return;

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice =
      voices.find((voice) => /en-IN/i.test(voice.lang) && /female|zira|samantha|google/i.test(voice.name)) ||
      voices.find((voice) => /en-IN/i.test(voice.lang)) ||
      voices.find((voice) => /^en/i.test(voice.lang));

    const speakChunk = (index: number) => {
      if (token !== playTokenRef.current) return;
      if (index >= chunksRef.current.length) {
        utteranceRef.current = null;
        setLiveLine("");
        setState("idle");
        return;
      }

      chunkIndexRef.current = index;
      const line = chunksRef.current[index];
      setLiveLine(line);

      const utterance = new SpeechSynthesisUtterance(line);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => setState("speaking");
      utterance.onend = () => {
        if (token !== playTokenRef.current) return;
        utteranceRef.current = null;
        speakChunk(index + 1);
      };
      utterance.onerror = () => {
        if (token !== playTokenRef.current) return;
        utteranceRef.current = null;
        speakChunk(index + 1);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    };

    setPanelOpen(true);
    speakChunk(0);
  }, [chunks]);

  const pauseSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setState("paused");
    }
  }, []);

  const resumeSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setState("speaking");
    }
  }, []);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);

    const onPlayRequest = () => {
      setPanelOpen(true);
      startSpeaking();
    };

    window.addEventListener(VOICE_BRIEF_EVENT, onPlayRequest);
    return () => {
      window.removeEventListener(VOICE_BRIEF_EVENT, onPlayRequest);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [startSpeaking]);

  const onPrimaryClick = () => {
    if (!supported) return;
    if (state === "idle") {
      startSpeaking();
      return;
    }
    if (state === "speaking") {
      pauseSpeaking();
      return;
    }
    resumeSpeaking();
  };

  const onDownloadMp3 = async () => {
    setDownloading(true);
    try {
      const response = await fetch(DAILY_AUDIO_PUBLIC_PATH);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "enn-daily-education-brief.mp3";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(DAILY_AUDIO_PUBLIC_PATH, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  if (!panelOpen) return null;

  return (
    <div className="enn-voice-root is-open">
      <div className="enn-voice-panel" role="region" aria-label="Today's education news voice brief">
        <div className="enn-voice-panel-head">
          <div>
            <p className="enn-voice-kicker mb-0">Voice AI</p>
            <h2 className="enn-voice-title mb-0">Today&apos;s education brief</h2>
          </div>
          <button
            type="button"
            className="enn-voice-close"
            aria-label="Close voice brief"
            onClick={() => {
              stopSpeaking();
              setPanelOpen(false);
            }}
          >
            ✕
          </button>
        </div>

        <div className="enn-voice-live">
          <p className="enn-voice-live-label mb-1">What AI is speaking</p>
          <p className="enn-voice-live-line mb-2">{liveLine || "Press Play to hear today’s education brief."}</p>
        </div>

        <div className="enn-voice-controls">
          <button type="button" className="enn-voice-play" onClick={onPrimaryClick} disabled={!supported}>
            {state === "idle" ? "▶ Play brief" : state === "speaking" ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button type="button" className="enn-voice-stop" onClick={stopSpeaking} disabled={state === "idle"}>
            Stop
          </button>
          <button
            type="button"
            className="enn-voice-mp3"
            onClick={onDownloadMp3}
            disabled={downloading}
            aria-label="Download today's education brief as MP3"
          >
            {downloading ? "Saving…" : "Download MP3"}
          </button>
        </div>

        {!supported ? (
          <p className="enn-voice-unsupported mb-0">Voice playback is not supported in this browser.</p>
        ) : null}
      </div>
    </div>
  );
}
