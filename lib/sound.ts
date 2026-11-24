// Tiny UI sound engine. Everything is synthesised with Web Audio, so there are
// no audio files to load. Browsers only allow audio after the visitor has
// clicked or pressed a key, so sounds stay silent until then.

type Kind = "tick" | "tock";

const STORAGE_KEY = "eo-sound";

let ctx: AudioContext | null = null;
let enabled = true;
let unlocked = false;
let lastPlayed = 0;
const listeners = new Set<(on: boolean) => void>();

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

export function initSound() {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(STORAGE_KEY) === "off") enabled = false;
  } catch {
    /* storage blocked: keep default */
  }
  listeners.forEach((fn) => fn(enabled));

  const unlock = () => {
    unlocked = true;
    getCtx();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

export function isSoundOn() {
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    /* ignore */
  }
  listeners.forEach((fn) => fn(on));
}

export function onSoundChange(fn: (on: boolean) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function play(kind: Kind = "tick") {
  if (!enabled || !unlocked) return;
  const now = performance.now();
  if (now - lastPlayed < 45) return; // avoid machine-gun ticks when sweeping across cards
  lastPlayed = now;

  const c = getCtx();
  if (!c) return;
  const t = c.currentTime + 0.005;

  // A soft wooden tap, not a beep: a little puff of filtered noise (the
  // "contact") over a quick sine that drops in pitch (the "body"), both gone
  // in a few hundredths of a second. Pitched around 0.8-1.2 kHz so laptop
  // and phone speakers can actually play it.
  const out = c.createGain();
  out.gain.value = 1;
  const soft = c.createBiquadFilter();
  soft.type = "lowpass";
  soft.frequency.value = kind === "tick" ? 7000 : 5000;
  soft.Q.value = 0.5;
  soft.connect(out);
  out.connect(c.destination);

  // Body.
  const body = c.createOscillator();
  const bodyGain = c.createGain();
  body.type = "sine";
  const [f0, f1, len] = kind === "tick" ? [1150, 800, 0.07] : [760, 520, 0.12];
  body.frequency.setValueAtTime(f0, t);
  body.frequency.exponentialRampToValueAtTime(f1, t + len * 0.6);
  bodyGain.gain.setValueAtTime(0.0001, t);
  bodyGain.gain.exponentialRampToValueAtTime(kind === "tick" ? 0.2 : 0.24, t + 0.003);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, t + len);
  body.connect(bodyGain);
  bodyGain.connect(soft);
  body.start(t);
  body.stop(t + len + 0.02);

  // Contact.
  const tap = c.createBufferSource();
  tap.buffer = noise(c);
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.frequency.value = kind === "tick" ? 2800 : 1800;
  band.Q.value = 1.2;
  const tapGain = c.createGain();
  const tapLen = kind === "tick" ? 0.014 : 0.022;
  tapGain.gain.setValueAtTime(0.0001, t);
  tapGain.gain.exponentialRampToValueAtTime(0.12, t + 0.002);
  tapGain.gain.exponentialRampToValueAtTime(0.0001, t + tapLen);
  tap.connect(band);
  band.connect(tapGain);
  tapGain.connect(soft);
  tap.start(t);
  tap.stop(t + tapLen + 0.01);
}

let noiseBuf: AudioBuffer | null = null;
function noise(c: AudioContext) {
  if (!noiseBuf) {
    const n = Math.floor(c.sampleRate * 0.06);
    noiseBuf = c.createBuffer(1, n, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}
