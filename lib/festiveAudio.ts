/** Web Audio festive rocket / cracker SFX (no external files, no UI). */

let audioCtx: AudioContext | null = null;
let unlocked = false;

function ctx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  return audioCtx;
}

export async function unlockFestiveAudio() {
  const c = ctx();
  if (!c) return false;
  if (c.state === "suspended") {
    try {
      await c.resume();
    } catch {
      return false;
    }
  }
  unlocked = c.state === "running";
  return unlocked;
}

export function isFestiveAudioUnlocked() {
  return unlocked && audioCtx?.state === "running";
}

/** Rising whistle as the big rocket crosses the sky. */
export function playRocketWhoosh() {
  const c = ctx();
  if (!c || !unlocked) return;
  const now = c.currentTime;
  const dur = 1.85;

  const osc = c.createOscillator();
  const osc2 = c.createOscillator();
  const g = c.createGain();
  osc.type = "sawtooth";
  osc2.type = "triangle";
  osc.frequency.setValueAtTime(220, now);
  osc.frequency.exponentialRampToValueAtTime(980, now + dur);
  osc2.frequency.setValueAtTime(330, now);
  osc2.frequency.exponentialRampToValueAtTime(1400, now + dur);
  g.gain.setValueAtTime(0.0001, now);
  g.gain.exponentialRampToValueAtTime(0.07, now + 0.12);
  g.gain.setValueAtTime(0.06, now + dur * 0.75);
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 4;
  filter.frequency.setValueAtTime(500, now);
  filter.frequency.exponentialRampToValueAtTime(2200, now + dur);

  osc.connect(filter);
  osc2.connect(filter);
  filter.connect(g);
  g.connect(c.destination);
  osc.start(now);
  osc2.start(now);
  osc.stop(now + dur + 0.05);
  osc2.stop(now + dur + 0.05);

  const noiseBuf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const data = noiseBuf.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (0.15 + 0.35 * (i / data.length));
  }
  const src = c.createBufferSource();
  src.buffer = noiseBuf;
  const ng = c.createGain();
  const nf = c.createBiquadFilter();
  nf.type = "highpass";
  nf.frequency.value = 900;
  ng.gain.setValueAtTime(0.0001, now);
  ng.gain.exponentialRampToValueAtTime(0.045, now + 0.2);
  ng.gain.exponentialRampToValueAtTime(0.0001, now + dur);
  src.connect(nf);
  nf.connect(ng);
  ng.connect(c.destination);
  src.start(now);
  src.stop(now + dur);
}

/** Bigger cracker / firework boom with sparkle tails. */
export function playCrackerBlast() {
  const c = ctx();
  if (!c || !unlocked) return;
  const now = c.currentTime;

  const boomBuf = c.createBuffer(1, Math.floor(c.sampleRate * 0.55), c.sampleRate);
  const boomData = boomBuf.getChannelData(0);
  for (let i = 0; i < boomData.length; i += 1) {
    const t = i / boomData.length;
    boomData[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 2.2);
  }
  const boom = c.createBufferSource();
  boom.buffer = boomBuf;
  const boomFilter = c.createBiquadFilter();
  boomFilter.type = "lowpass";
  boomFilter.frequency.setValueAtTime(1800, now);
  boomFilter.frequency.exponentialRampToValueAtTime(120, now + 0.45);
  const boomGain = c.createGain();
  boomGain.gain.setValueAtTime(0.0001, now);
  boomGain.gain.exponentialRampToValueAtTime(0.55, now + 0.012);
  boomGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
  boom.connect(boomFilter);
  boomFilter.connect(boomGain);
  boomGain.connect(c.destination);
  boom.start(now);
  boom.stop(now + 0.55);

  const thump = c.createOscillator();
  const thumpGain = c.createGain();
  thump.type = "sine";
  thump.frequency.setValueAtTime(90, now);
  thump.frequency.exponentialRampToValueAtTime(38, now + 0.28);
  thumpGain.gain.setValueAtTime(0.0001, now);
  thumpGain.gain.exponentialRampToValueAtTime(0.45, now + 0.01);
  thumpGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);
  thump.connect(thumpGain);
  thumpGain.connect(c.destination);
  thump.start(now);
  thump.stop(now + 0.35);

  for (let i = 0; i < 5; i += 1) {
    const start = now + 0.04 + i * 0.05;
    const spark = c.createOscillator();
    const sparkGain = c.createGain();
    spark.type = i % 2 === 0 ? "triangle" : "sine";
    const freq = 700 + Math.random() * 1600;
    spark.frequency.setValueAtTime(freq, start);
    spark.frequency.exponentialRampToValueAtTime(freq * 0.45, start + 0.22);
    sparkGain.gain.setValueAtTime(0.0001, start);
    sparkGain.gain.exponentialRampToValueAtTime(0.07, start + 0.015);
    sparkGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
    spark.connect(sparkGain);
    sparkGain.connect(c.destination);
    spark.start(start);
    spark.stop(start + 0.26);
  }
}
