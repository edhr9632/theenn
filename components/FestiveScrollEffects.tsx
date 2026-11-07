"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  isFestiveAudioUnlocked,
  playCrackerBlast,
  playRocketWhoosh,
  unlockFestiveAudio,
} from "@/lib/festiveAudio";

type RocketFlight = {
  id: number;
  lane: number;
  duration: number;
  phase: "fly" | "blast";
};

const LAUNCH_COOLDOWN_MS = 4500;
const FLIGHT_MS = 2800;
const BLAST_MS = 1100;

function RocketSvg() {
  return (
    <svg className="festive-rocket-svg" viewBox="0 0 64 140" aria-hidden="true">
      <defs>
        <linearGradient id="festiveRocketBody" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#e8eef8" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
        <linearGradient id="festiveRocketNose" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff1c2" />
          <stop offset="55%" stopColor="#ff7a45" />
          <stop offset="100%" stopColor="#d62839" />
        </linearGradient>
        <linearGradient id="festiveRocketFlame" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#ffe082" />
          <stop offset="70%" stopColor="#ff6b00" />
          <stop offset="100%" stopColor="rgba(255,40,40,0)" />
        </linearGradient>
      </defs>

      {/* fins */}
      <path d="M18 78 L4 108 L22 96 Z" fill="#d62839" />
      <path d="M46 78 L60 108 L42 96 Z" fill="#b81f2e" />

      {/* body */}
      <rect x="20" y="34" width="24" height="62" rx="8" fill="url(#festiveRocketBody)" stroke="#64748b" strokeWidth="1.2" />
      <rect x="20" y="78" width="24" height="10" fill="#d62839" />

      {/* window */}
      <circle cx="32" cy="52" r="7" fill="#1a4099" stroke="#0f172a" strokeWidth="2" />
      <circle cx="30" cy="50" r="2.4" fill="#dff6ff" opacity="0.9" />

      {/* nose */}
      <path d="M32 6 L48 36 L16 36 Z" fill="url(#festiveRocketNose)" />
      <path d="M32 6 L40 28 L24 28 Z" fill="rgba(255,255,255,0.35)" />

      {/* nozzle */}
      <rect x="24" y="96" width="16" height="8" rx="2" fill="#1e293b" />

      {/* flame */}
      <path className="festive-rocket-flame-path" d="M32 104 C26 112 24 122 32 138 C40 122 38 112 32 104 Z" fill="url(#festiveRocketFlame)" />
      <path className="festive-rocket-flame-core-path" d="M32 108 C29 114 28 120 32 130 C36 120 35 114 32 108 Z" fill="#fff7d1" />
    </svg>
  );
}

export default function FestiveScrollEffects() {
  const pathname = usePathname();
  const [flight, setFlight] = useState<RocketFlight | null>(null);
  const [ready, setReady] = useState(false);
  const idRef = useRef(0);
  const busyRef = useRef(false);
  const lastLaunchRef = useRef(0);
  const lastScrollRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const isAdmin = pathname?.startsWith("/admin") ?? false;

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const launchBigRocket = useCallback(() => {
    if (reducedMotionRef.current || busyRef.current) return;
    const now = Date.now();
    if (now - lastLaunchRef.current < LAUNCH_COOLDOWN_MS) return;

    busyRef.current = true;
    lastLaunchRef.current = now;
    clearTimers();

    const withSound = isFestiveAudioUnlocked();
    const next: RocketFlight = {
      id: (idRef.current += 1),
      lane: 36 + Math.random() * 28,
      duration: FLIGHT_MS / 1000,
      phase: "fly",
    };

    setFlight(next);
    if (withSound) playRocketWhoosh();

    timersRef.current.push(
      window.setTimeout(() => {
        setFlight((current) => (current && current.id === next.id ? { ...current, phase: "blast" } : current));
        if (withSound) playCrackerBlast();
      }, FLIGHT_MS),
    );

    timersRef.current.push(
      window.setTimeout(() => {
        setFlight(null);
        busyRef.current = false;
      }, FLIGHT_MS + BLAST_MS),
    );
  }, []);

  useEffect(() => {
    if (isAdmin) return;
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReady(true);

    const unlock = () => {
      void unlockFestiveAudio();
    };
    window.addEventListener("pointerdown", unlock, { passive: true, once: true });
    window.addEventListener("keydown", unlock, { passive: true, once: true });
    window.addEventListener("touchstart", unlock, { passive: true, once: true });

    const auto = window.setTimeout(() => {
      launchBigRocket();
    }, 900);

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      window.clearTimeout(auto);
      clearTimers();
    };
  }, [isAdmin, launchBigRocket]);

  useEffect(() => {
    if (isAdmin || !ready) return;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const delta = Math.abs(y - lastScrollRef.current);
      lastScrollRef.current = y;
      if (delta < 24) return;
      launchBigRocket();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isAdmin, ready, launchBigRocket]);

  if (isAdmin || !ready) return null;

  return (
    <div className="festive-rocket-layer" aria-hidden="true">
      {flight ? (
        <>
          {flight.phase === "fly" ? (
            <div
              key={`fly-${flight.id}`}
              className="festive-rocket festive-rocket--ascent"
              style={{
                left: `${flight.lane}%`,
                ["--rocket-duration" as string]: `${flight.duration}s`,
              }}
            >
              <RocketSvg />
            </div>
          ) : null}

          {flight.phase === "blast" ? (
            <div
              key={`blast-${flight.id}`}
              className="festive-rocket-blast festive-rocket-blast--xl"
              style={{ left: `${flight.lane}%` }}
            >
              <span className="festive-rocket-flash" />
              {Array.from({ length: 32 }, (_, i) => (
                <i
                  key={i}
                  className="festive-rocket-spark"
                  style={{
                    ["--spark-angle" as string]: `${i * (360 / 32)}deg`,
                    ["--spark-dist" as string]: `${110 + (i % 7) * 26}px`,
                  }}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
