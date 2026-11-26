"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cursor01Icon } from "@hugeicons/core-free-icons";
import "./recording.css";

/*
  The pieces every exploration shares, so they all play like one Screen
  Studio recording: the design is drawn at its real size (W x H), a camera
  scales and moves it (wide, then gliding in to each click and back out), a
  cursor moves and clicks, and a script of timed steps drives it all. It
  plays while `active`, then fades and starts over.
*/

export type Cam = [x: number, y: number, zoom: number];

export type Base = {
  cursor: [number, number];
  click: number;
  cam: Cam;
  fade: boolean;
  still: boolean;
};

type Step<S> = [number, (s: S) => S];
export type Script<S> = { steps: Step<S>[]; total: number };

export type Api<S> = {
  /** After dt ms, change the state. */
  at: (dt: number, f: (s: S) => S) => void;
  /** After dt ms, glide the cursor to p (and the camera, if given). */
  move: (dt: number, p: readonly number[], cam?: Cam) => void;
  /** After dt ms, click; the result shows a beat later. */
  click: (dt: number, then: (s: S) => S) => void;
};

export function script<S extends Base>(write: (api: Api<S>) => void): Script<S> {
  const steps: Step<S>[] = [];
  let t = 0;
  const at = (dt: number, f: (s: S) => S) => {
    t += dt;
    steps.push([t, f]);
  };
  const move = (dt: number, p: readonly number[], cam?: Cam) => at(dt, (s) => ({ ...s, cursor: [p[0], p[1]], cam: cam ?? s.cam }));
  const click = (dt: number, then: (s: S) => S) => {
    at(dt, (s) => ({ ...s, click: s.click + 1 }));
    at(130, then);
  };
  write({ at, move, click });
  return { steps, total: t + 520 };
}

/** `rest`: what shows while it isn't playing (off screen, or reduced motion). */
export function useRecording<S extends Base>(active: boolean, start: S, sc: Script<S>, rest?: S): S {
  const [s, set] = useState<S>(start);
  useEffect(() => {
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => timers.splice(0).forEach((id) => window.clearTimeout(id));
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set({ ...(rest ?? start), still: true });
      return clear;
    }
    const run = (delay: number) => {
      for (const [t, fn] of sc.steps) later(delay + t, () => set(fn));
      later(delay + sc.total, () => {
        set({ ...start, fade: true, still: true });
        later(60, () => set(start));
        run(500);
      });
    };
    set(start);
    run(400);
    return clear;
  }, [active, start, sc, rest]);
  return s;
}

/** The frame: sized to the design's shape, with the camera inside. */
export function Recording({
  w,
  h,
  s,
  label,
  className = "",
  pointer = true,
  children,
}: {
  w: number;
  h: number;
  s: Base;
  label: string;
  className?: string;
  /** false for phone explorations: they draw their own tap dot. */
  pointer?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Zoom around a point, never showing past the design's edges.
  const base = vw / w;
  const [fx, fy, z] = s.cam;
  const k = base * z;
  const vh = h * base;
  const tx = Math.min(0, Math.max(vw - w * k, vw / 2 - fx * k));
  const ty = Math.min(0, Math.max(vh - h * k, vh / 2 - fy * k));

  return (
    <div
      ref={ref}
      className={`rc ${className}${s.fade ? " is-fading" : ""}${s.still ? " is-still" : ""}`}
      style={{ aspectRatio: `${w} / ${h}`, "--ar": w / h } as CSSProperties}
      role="img"
      aria-label={label}
    >
      {vw > 0 && (
        <div className="rc-cam" style={{ transform: `translate3d(${tx}px, ${ty}px, 0) scale(${k})` }}>
          <div className="rc-art" style={{ width: w, height: h }}>
            {children}
            {pointer ? <Cursor at={s.cursor} click={s.click} /> : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Cursor({ at, click }: { at: [number, number]; click: number }) {
  return (
    <span className="rc-cursor" style={{ transform: `translate3d(${at[0]}px, ${at[1]}px, 0)` }}>
      {click > 0 && <i key={click} className="rc-ripple" />}
      <span key={`c${click}`} className={click > 0 ? "rc-press" : undefined}>
        <HugeiconsIcon icon={Cursor01Icon} size={26} color="#fff" strokeWidth={1.6} />
      </span>
    </span>
  );
}
