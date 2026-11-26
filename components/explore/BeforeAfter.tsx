"use client";

import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import "./before-after.css";

/*
  Before and after, as on Laura Gao's Koddi page: the two versions laid on
  top of each other, a line between them with a round handle, and a label
  in each bottom corner. It glides back and forth by itself while on
  screen; in the open window it can also be dragged (and stops gliding once
  it has been).
*/

type Props = {
  before: string;
  after: string;
  w: number;
  h: number;
  labels: [string, string];
  active: boolean;
  draggable?: boolean;
  label: string;
};

// Where the line sits over time: start on the wireframe, sweep across to
// the design, hold, come back to the middle, hold.
const KEYS: [number, number][] = [
  [0, 0.9],
  [900, 0.9],
  [3300, 0.1],
  [5100, 0.1],
  [6900, 0.5],
  [8700, 0.5],
  [10500, 0.9],
];
const LOOP = 10500;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function at(ms: number) {
  const t = ms % LOOP;
  for (let i = 1; i < KEYS.length; i++) {
    const [t1, p1] = KEYS[i];
    const [t0, p0] = KEYS[i - 1];
    if (t <= t1) return p0 + (p1 - p0) * ease((t - t0) / (t1 - t0));
  }
  return KEYS[0][1];
}

export default function BeforeAfter({ before, after, w, h, labels, active, draggable = false, label }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const held = useRef(false); // dragged by hand: stop gliding

  const set = (p: number) => box.current?.style.setProperty("--p", String(Math.min(0.98, Math.max(0.02, p))));

  useEffect(() => {
    if (!active || held.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set(0.5);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      if (held.current) return;
      set(at(now - t0));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);

  const drag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggable) return;
    const el = e.currentTarget;
    held.current = true;
    el.setPointerCapture(e.pointerId);
    const move = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      set((ev.clientX - r.left) / r.width);
    };
    move(e.nativeEvent);
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  };

  return (
    <div
      ref={box}
      className={`ba${draggable ? " ba--drag" : ""}`}
      style={{ aspectRatio: `${w} / ${h}`, "--ar": w / h, "--p": 0.9 } as CSSProperties}
      onPointerDown={drag}
      role="img"
      aria-label={label}
    >
      <img className="ba-img" src={after} alt="" draggable={false} />
      <img className="ba-img ba-before" src={before} alt="" draggable={false} />
      <span className="ba-line" aria-hidden="true">
        <span className="ba-handle">
          <CaretLeft weight="bold" />
          <CaretRight weight="bold" />
        </span>
      </span>
      <span className="ba-tag ba-tag--before">{labels[0]}</span>
      <span className="ba-tag ba-tag--after">{labels[1]}</span>
    </div>
  );
}
