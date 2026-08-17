"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DAILY_AUDIO_FEED_PATH,
  DAILY_AUDIO_PUBLIC_PATH,
} from "@/lib/dailyAudio";
import {
  VOICE_BRIEF_EVENT,
  buildEducationVoiceScript,
  type VoiceBriefStory,
} from "@/lib/educationVoiceBrief";

type VoiceState = "idle" | "speaking" | "paused";

export default function EducationVoiceBrief() {
  const [stories, setStories] = useState<VoiceBriefStory[]>([]);
  const script = useMemo(() => buildEducationVoiceScript(stories), [stories]);
  const [state, setState] = useState<VoiceState>("idle");
  const [supported, setSupported] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [absoluteMp3Url, setAbsoluteMp3Url] = useState(DAILY_AUDIO_PUBLIC_PATH);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    setAbsoluteMp3Url(`${window.location.origin}${DAILY_AUDIO_PUBLIC_PATH}`);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/education-brief")
      .then((response) => response.json())
      .then((data: { stories?: VoiceBriefStory[] }) => {
        if (!cancelled && Array.isArray(data.stories)) setStories(data.stories);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setState("idle");
  }, []);

  const startSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(script);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.volume = 1;

    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((voice) => /en-IN/i.test(voice.lang) && /female|zira|samantha|google/i.test(voice.name)) ||
      voices.find((voice) => /en-IN/i.test(voice.lang)) ||
      voices.find((voice) => /^en/i.test(voice.lang));

    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => setState("speaking");
    utterance.onend = () => {
      utteranceRef.current = null;
      setState("idle");
    };
    utterance.onerror = () => {
      utteranceRef.current = null;
      setState("idle");
    };

    utteranceRef.current = utterance;
    setPanelOpen(true);
    window.speechSynthesis.speak(utterance);
  }, [script]);

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

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(absoluteMp3Url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
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

        <p className="enn-voice-note mb-2">
          Listening to the top {stories.length} education headlines only — not general world or markets news.
        </p>

        <ol className="enn-voice-list list-unstyled mb-3">
          {stories.map((story, index) => (
            <li key={story.href} className="enn-voice-item">
              <span className="enn-voice-num">{index + 1}</span>
              <div>
                <Link href={story.href} className="enn-voice-story-title" onClick={() => stopSpeaking()}>
                  {story.title}
                </Link>
                <span className="enn-voice-story-meta">
                  {story.category} · {story.date}
                </span>
              </div>
            </li>
          ))}
        </ol>

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

        <div className="enn-voice-alarm">
          <p className="enn-voice-alarm-label mb-1">Morning alarm / smart speaker link</p>
          <p className="enn-voice-alarm-note mb-2">
            This URL always serves today&apos;s latest education brief as an MP3 — use it in alarms, podcast apps, or
            automations.
          </p>
          <code className="enn-voice-alarm-url">{absoluteMp3Url}</code>
          <div className="enn-voice-alarm-actions">
            <button type="button" className="enn-voice-alarm-btn" onClick={onCopyLink}>
              {copied ? "Copied" : "Copy link"}
            </button>
            <a
              className="enn-voice-alarm-btn"
              href={DAILY_AUDIO_PUBLIC_PATH}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open MP3
            </a>
            <a
              className="enn-voice-alarm-btn"
              href={DAILY_AUDIO_FEED_PATH}
              target="_blank"
              rel="noopener noreferrer"
            >
              RSS audio feed
            </a>
          </div>
        </div>

        {!supported ? (
          <p className="enn-voice-unsupported mb-0">Voice playback is not supported in this browser.</p>
        ) : null}
      </div>
    </div>
  );
}
