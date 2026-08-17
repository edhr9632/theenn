"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { splitSpeechChunks } from "@/lib/articleAudio";

const DEFAULT_SPOTIFY_URL =
  process.env.NEXT_PUBLIC_SPOTIFY_SHOW_URL?.trim() ||
  "https://open.spotify.com/search/Education%20News%20Network";

type VoiceState = "idle" | "speaking" | "paused";

export type EnnMediaPlayerProps = {
  title: string;
  showLabel: string;
  description: string;
  durationLabel?: string;
  script: string;
  downloadUrl?: string;
  downloadFileName?: string;
  spotifyUrl?: string;
  shareUrl?: string;
  subscribeUrl?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  keywords?: string[];
  highlights?: string[];
};

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M7 5h3.5a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm6.5 0H17a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3.5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  );
}

function SpotifyGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3c-.2.3-.6.4-1 .2-2.7-1.7-6.1-2-10.1-1.1-.4.1-.7-.2-.8-.5-.1-.4.2-.7.5-.8 4.4-1 8.1-.6 11.1 1.2.4.2.5.6.3 1zm1.5-3.1c-.3.4-.8.5-1.2.3-3.1-1.9-7.8-2.5-11.4-1.3-.4.1-.9-.1-1-.6-.1-.4.1-.9.6-1 4.2-1.3 9.4-.6 13 1.5.4.2.5.7.2 1.1zm.1-3.2C15.2 8.7 8.8 8.5 5.2 9.6c-.5.2-1.1-.1-1.3-.6-.2-.5.1-1.1.6-1.3 4.2-1.3 11.2-1 15.6 1.5.5.3.6.9.4 1.3-.3.5-.9.7-1.4.4z"
      />
    </svg>
  );
}

function SoundWaveIcon({ color = "#5BA3E0" }: { color?: string }) {
  return (
    <svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">
      <path
        d="M1 7 C2.5 3, 4 11, 5.5 7 S8.5 3, 10 7 13 11, 14.5 7 17 3, 17 7"
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WaveCanvas({ playing, progress }: { playing: boolean; progress: number }) {
  return (
    <div className={`enn-media-wave${playing ? " is-live" : ""}`} aria-hidden="true">
      <svg className="enn-media-wave-svg" viewBox="0 0 640 72" preserveAspectRatio="none">
        <defs>
          <linearGradient id="ennWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7EB8E8" />
            <stop offset="50%" stopColor="#1a4099" />
            <stop offset="100%" stopColor="#5BA3E0" />
          </linearGradient>
        </defs>
        <path
          className="enn-media-wave-path enn-media-wave-path-a"
          d="M0 36 C40 12, 80 60, 120 36 S200 12, 240 36 320 60, 360 36 440 12, 480 36 560 60, 640 36"
          fill="none"
          stroke="url(#ennWaveGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          className="enn-media-wave-path enn-media-wave-path-b"
          d="M0 36 C50 58, 90 14, 140 36 S230 58, 280 36 370 14, 420 36 510 58, 560 36 620 14, 640 36"
          fill="none"
          stroke="#5BA3E0"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.55"
        />
        <path
          className="enn-media-wave-path enn-media-wave-path-c"
          d="M0 36 C30 22, 70 50, 110 36 S190 22, 230 36 310 50, 350 36 430 22, 470 36 550 50, 590 36 630 22, 640 36"
          fill="none"
          stroke="#0b2a5c"
          strokeWidth="1.2"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
      <span className="enn-media-wave-progress" style={{ width: `${Math.max(2, progress)}%` }} />
    </div>
  );
}

function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function pickVoice(voices: SpeechSynthesisVoice[]) {
  return (
    voices.find((voice) => /en-IN/i.test(voice.lang) && /google|natural|neural/i.test(voice.name)) ||
    voices.find((voice) => /en-IN/i.test(voice.lang)) ||
    voices.find((voice) => /en-GB/i.test(voice.lang) && /female|google|natural/i.test(voice.name)) ||
    voices.find((voice) => /^en[-_]?US/i.test(voice.lang) && /google|samantha|zira|natural/i.test(voice.name)) ||
    voices.find((voice) => /^en/i.test(voice.lang)) ||
    null
  );
}

function LiveScriptText({ text, progress, active }: { text: string; progress: number; active: boolean }) {
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);
  const spokenCount = active ? Math.min(words.length, Math.ceil((progress / 100) * words.length)) : 0;

  return (
    <p className="enn-media-live-script" aria-live="polite">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className={index < spokenCount ? "is-spoken" : ""}>
          {word}{" "}
        </span>
      ))}
    </p>
  );
}

function BrandPanel() {
  return (
    <div className="enn-media-brand">
      <Image
        src="/images/Enn_logo1.png"
        alt="Education News Network"
        width={220}
        height={88}
        className="enn-media-logo"
        priority={false}
      />
    </div>
  );
}

export default function EnnMediaPlayer({
  title,
  showLabel,
  description,
  durationLabel,
  script,
  downloadUrl,
  downloadFileName = "enn-audio.mp3",
  spotifyUrl = DEFAULT_SPOTIFY_URL,
  shareUrl,
  subscribeUrl = "/subscribe",
  keywords = [],
  highlights = [],
}: EnnMediaPlayerProps) {
  const [state, setState] = useState<VoiceState>("idle");
  const [supported, setSupported] = useState(true);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showDescription, setShowDescription] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [liveLine, setLiveLine] = useState(description);
  const chunksRef = useRef<string[]>([]);
  const chunkIndexRef = useRef(0);
  const playTokenRef = useRef(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const startedAtRef = useRef(0);
  const durationRef = useRef(0);
  const pausedElapsedRef = useRef(0);
  const tickRef = useRef<number | null>(null);

  const chunks = useMemo(() => splitSpeechChunks(script), [script]);

  const estimatedSeconds = useMemo(() => {
    const wordCount = script.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(10, (wordCount / 145) * 60);
  }, [script]);

  const clearTick = useCallback(() => {
    if (tickRef.current) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTick = useCallback(() => {
    clearTick();
    tickRef.current = window.setInterval(() => {
      if (!durationRef.current) return;
      const nextElapsed = pausedElapsedRef.current + (Date.now() - startedAtRef.current) / 1000;
      setElapsed(nextElapsed);
      setProgress(Math.min(99, (nextElapsed / durationRef.current) * 100));
    }, 180);
  }, [clearTick]);

  const finishPlayback = useCallback(() => {
    utteranceRef.current = null;
    clearTick();
    setProgress(100);
    setElapsed(durationRef.current);
    setState("idle");
    window.setTimeout(() => {
      setProgress(0);
      setElapsed(0);
      setLiveLine(description);
    }, 1200);
  }, [clearTick, description]);

  const speakChunk = useCallback(
    (index: number, token: number) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        setSupported(false);
        return;
      }
      if (token !== playTokenRef.current) return;

      const queue = chunksRef.current;
      if (index >= queue.length) {
        finishPlayback();
        return;
      }

      chunkIndexRef.current = index;
      const line = queue[index];
      setLiveLine(line);

      const utterance = new SpeechSynthesisUtterance(line);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;
      const preferred = pickVoice(window.speechSynthesis.getVoices());
      if (preferred) utterance.voice = preferred;

      utterance.onend = () => {
        if (token !== playTokenRef.current) return;
        speakChunk(index + 1, token);
      };
      utterance.onerror = (event) => {
        if (token !== playTokenRef.current) return;
        if (event.error === "interrupted" || event.error === "canceled") return;
        speakChunk(index + 1, token);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [finishPlayback],
  );

  const stop = useCallback(() => {
    playTokenRef.current += 1;
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    utteranceRef.current = null;
    chunkIndexRef.current = 0;
    clearTick();
    pausedElapsedRef.current = 0;
    setProgress(0);
    setElapsed(0);
    setLiveLine(description);
    setState("idle");
  }, [clearTick, description]);

  const play = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
      return;
    }

    const queue = chunks.length ? chunks : splitSpeechChunks(script);
    if (!queue.length) return;

    playTokenRef.current += 1;
    const token = playTokenRef.current;
    chunksRef.current = queue;
    chunkIndexRef.current = 0;
    if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
      window.speechSynthesis.cancel();
    }

    durationRef.current = estimatedSeconds;
    pausedElapsedRef.current = 0;
    startedAtRef.current = Date.now();
    setState("speaking");
    setLiveLine(queue[0]);
    startTick();
    speakChunk(0, token);
  }, [chunks, estimatedSeconds, script, speakChunk, startTick]);

  const pause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (state !== "speaking") return;
    pausedElapsedRef.current += (Date.now() - startedAtRef.current) / 1000;
    playTokenRef.current += 1;
    window.speechSynthesis.cancel();
    clearTick();
    setState("paused");
  }, [clearTick, state]);

  const resume = useCallback(() => {
    if (state !== "paused") {
      play();
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) {
      setSupported(false);
      return;
    }

    playTokenRef.current += 1;
    const token = playTokenRef.current;
    startedAtRef.current = Date.now();
    setState("speaking");
    startTick();
    speakChunk(chunkIndexRef.current, token);
  }, [play, speakChunk, startTick, state]);

  useEffect(() => {
    const ok = typeof window !== "undefined" && "speechSynthesis" in window;
    setSupported(ok);
    if (!ok) return;
    window.speechSynthesis.getVoices();
    return () => {
      playTokenRef.current += 1;
      window.speechSynthesis.cancel();
      clearTick();
    };
  }, [clearTick]);

  useEffect(() => {
    setShowDescription(false);
  }, [script, title]);

  const onPrimary = () => {
    if (!supported) return;
    if (state === "idle") {
      play();
      return;
    }
    if (state === "speaking") {
      pause();
      return;
    }
    resume();
  };

  const onShare = async () => {
    const url = shareUrl || window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, text: description, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
      window.setTimeout(() => setShareNote(""), 1800);
    } catch {
      setShareNote("");
    }
  };

  const onDownload = async () => {
    if (!downloadUrl || downloading) return;
    setDownloading(true);
    try {
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = downloadFileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloading(false);
    }
  };

  if (showDescription) {
    return (
      <section className="enn-media" aria-label="Audio description">
        <BrandPanel />
        <div className="enn-media-main enn-media-main-desc">
          <div className="enn-media-desc-bar">
            <button type="button" className="enn-media-hide" onClick={() => setShowDescription(false)}>
              ✕ HIDE
            </button>
            <span className="enn-media-eq" aria-hidden="true">
              <SoundWaveIcon />
            </span>
          </div>
          <h2 className="enn-media-desc-heading">Description</h2>
          <div className="enn-media-desc-scroll">
            <p className="enn-media-desc-text">{description}</p>
            {highlights.length ? (
              <ul className="enn-media-highlights list-unstyled mb-0">
                {highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
            {keywords.length ? (
              <p className="enn-media-desc-meta">Keywords · {keywords.join(", ")}</p>
            ) : null}
            {durationLabel ? <p className="enn-media-desc-meta">Duration · {durationLabel}</p> : null}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={`enn-media${state === "speaking" ? " is-playing" : ""}${state === "paused" ? " is-paused" : ""}`}
      aria-label="ENN audio player"
    >
      <BrandPanel />

      <div className="enn-media-main">
        <div className="enn-media-top">
          <button
            type="button"
            className="enn-media-play"
            onClick={onPrimary}
            disabled={!supported}
            aria-label={state === "idle" ? "Play audio" : state === "speaking" ? "Pause audio" : "Resume audio"}
          >
            {state === "speaking" ? <PauseIcon /> : <PlayIcon />}
          </button>

          <div className="enn-media-copy">
            <p className="enn-media-show mb-0">{showLabel}</p>
            <h2 className="enn-media-title mb-0">{title}</h2>
            <LiveScriptText
              text={liveLine || description}
              progress={state === "speaking" ? 100 : progress}
              active={state === "speaking" || state === "paused" || progress > 0}
            />
            {keywords.length || highlights.length ? (
              <div className="enn-media-listen-extras">
                {keywords.length ? (
                  <div className="enn-media-keywords" aria-label="Keywords">
                    {keywords.map((keyword) => (
                      <span key={keyword} className="enn-media-keyword">
                        {keyword}
                      </span>
                    ))}
                  </div>
                ) : null}
                {highlights.length ? (
                  <ul className="enn-media-highlights list-unstyled mb-0">
                    {highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ) : null}
          </div>

          <time className="enn-media-clock" dateTime={formatClock(elapsed)}>
            {formatClock(elapsed)}
          </time>
        </div>

        <WaveCanvas playing={state === "speaking"} progress={progress} />

        <div className="enn-media-footer">
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="enn-media-action enn-media-action-spotify"
          >
            <SpotifyGlyph />
            SAVE TO SPOTIFY
          </a>
          <button type="button" className="enn-media-action enn-media-action-share" onClick={onShare}>
            {shareNote || "SHARE"}
          </button>
          <a href={subscribeUrl} className="enn-media-action enn-media-action-subscribe">
            SUBSCRIBE
          </a>
          <button
            type="button"
            className="enn-media-action enn-media-action-description"
            onClick={() => setShowDescription(true)}
          >
            DESCRIPTION
          </button>
          {downloadUrl ? (
            <button
              type="button"
              className="enn-media-action enn-media-action-download"
              onClick={onDownload}
              disabled={downloading}
            >
              {downloading ? "SAVING…" : "DOWNLOAD MP3"}
            </button>
          ) : null}
          <span className="enn-media-eq enn-media-eq-end" aria-hidden="true">
            <SoundWaveIcon />
          </span>
        </div>

        {!supported ? (
          <p className="enn-media-error mb-0">Audio playback is not supported in this browser.</p>
        ) : null}
      </div>
    </section>
  );
}
