"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/*
  A phone that plays a real product flow, like the covers on Jenn Choi's work:
  either a recording of the real app, or the real screens one after another,
  with a soft dot showing each tap and an iOS-style slide to the next screen.
  It loops while `active`.

  Where the space is wider than tall, the phone is drawn larger than the space
  and the view glides to follow the action (the next tap). Where it fits, it
  simply sits in the middle.
*/

export type Step = { src: string; tap?: [number, number]; hold?: number };

type Props = {
  active: boolean;
  label: string;
  /** Size of the screen images or recording, in px. */
  w: number;
  h: number;
  steps?: Step[];
  video?: { src: string; poster?: string };
  /** Always show the whole phone, with generous space above and below. */
  contain?: boolean;
};

const BEZEL = 7;

export default function PhoneCover({ active, label, w, h, steps, video, contain = false }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const vidRef = useRef<HTMLVideoElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [i, setI] = useState(0);
  const [tap, setTap] = useState<{ x: number; y: number; k: number } | null>(null);
  const [fade, setFade] = useState(false);
  const [still, setStill] = useState(false);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Screens: hold, tap, slide on; at the end, fade and start again.
  useEffect(() => {
    if (!steps) return;
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => timers.splice(0).forEach((t) => window.clearTimeout(t));
    if (!active) {
      setStill(true);
      setI(0);
      setTap(null);
      setFade(false);
      return clear;
    }
    setStill(false);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return clear;
    const run = (start: number) => {
      let t = start;
      steps.forEach((s, k) => {
        t += s.hold ?? 1700;
        if (k === steps.length - 1) return;
        if (s.tap) {
          const [x, y] = s.tap;
          later(t, () => setTap({ x, y, k: Math.random() }));
          t += 560;
        }
        later(t, () => {
          setTap(null);
          setI(k + 1);
        });
        t += 120;
      });
      later(t, () => setFade(true));
      later(t + 480, () => {
        setStill(true);
        setI(0);
      });
      later(t + 560, () => {
        setStill(false);
        setFade(false);
        run(400);
      });
    };
    run(700);
    return clear;
  }, [active, steps]);

  // Recording: plays while active, from the start each time it opens.
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    v.currentTime = 0;
    const p = v.play();
    if (p) p.catch(() => {});
  }, [active]);

  // Phone size, and where the view sits.
  let pw = 0;
  let camY = 0;
  if (box) {
    const portrait = contain || box.h > box.w * 1.05;
    const margin = contain ? Math.round(Math.min(64, Math.max(24, box.h * 0.09))) : portrait ? 18 : 22;
    const aspect = h / w;
    pw = portrait
      ? Math.min(box.w * 0.7, (box.h - 2 * margin - 2 * BEZEL) / aspect + 2 * BEZEL)
      : Math.min(250, Math.max(168, box.w * 0.36));
    pw = Math.round(pw / 2) * 2;
    const sh = (pw - 2 * BEZEL) * aspect;
    const ph = sh + 2 * BEZEL;
    const focus = steps ? (steps[i]?.tap?.[1] ?? 0.5) : 0.5;
    camY =
      ph + 2 * margin <= box.h
        ? (box.h - ph) / 2
        : Math.min(margin, Math.max(box.h - margin - ph, box.h / 2 - (BEZEL + focus * sh)));
    camY = Math.round(camY);
  }

  const pos = (k: number) => (k < i ? "prev" : k > i ? "next" : "cur");

  return (
    <div className="cv-box" ref={boxRef}>
      {box && (
        <div className={`cv-cam${still ? " is-still" : ""}`} style={{ "--pw": `${pw}px`, transform: `translate3d(-50%, ${camY}px, 0)` } as CSSProperties}>
          <div className="cv-phone">
            <div className={`cv-screen${fade ? " is-fading" : ""}${still ? " is-still" : ""}`} style={{ aspectRatio: `${w} / ${h}` }}>
              {video ? (
                <video ref={vidRef} src={video.src} poster={video.poster} width={w} height={h} muted loop playsInline preload="metadata" aria-label={label} />
              ) : (
                steps?.map((s, k) => (
                  <img key={s.src} src={s.src} alt={k === i ? label : ""} width={w} height={h} data-pos={pos(k)} loading="lazy" decoding="async" />
                ))
              )}
              {tap && <span key={tap.k} className="cv-tap" style={{ left: `${tap.x * 100}%`, top: `${tap.y * 100}%` }} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
