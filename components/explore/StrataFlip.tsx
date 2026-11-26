"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import "./strata.css";

/*
  Strata (an exploration): Eucharia's own flip-book, as she built it. Her
  "Three rhythms. One book." header over the book, whose pages (her Figma
  vectors) turn with a real paper curl: Build Day, then Reflect, then the
  Monthly spread, and back. Uses the same library (StPageFlip) and pacing
  as her file; the pages are her SVGs as WebP so they load quickly.

  The composition is drawn at a fixed size (W x H) and scaled to fit.
*/

const W = 2400;
const H = 1380;
const TURN = 700; // page-turn duration
const HOLD = 1500; // pause on each spread

const PAGES = [1, 2, 3, 4, 5, 6].map((n) => `/explore/strata/page${n}.webp`);

export default function StrataFlip({ active, label }: { active: boolean; label: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const bookRef = useRef<HTMLDivElement>(null);
  const flip = useRef<import("page-flip/dist/js/page-flip.module.js").PageFlip | null>(null);
  const [vw, setVw] = useState(0);

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setVw(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The book, made once.
  useEffect(() => {
    let gone = false;
    const host = bookRef.current;
    if (!host) return;
    const mount = document.createElement("div");
    host.appendChild(mount);
    import("page-flip/dist/js/page-flip.module.js").then(({ PageFlip }) => {
      if (gone) return;
      const pf = new PageFlip(mount, {
        width: 750,
        height: 1010,
        size: "fixed",
        usePortrait: false,
        showCover: false,
        drawShadow: true,
        maxShadowOpacity: 0.6,
        flippingTime: TURN,
        useMouseEvents: false,
        mobileScrollSupport: false,
        autoSize: false,
      });
      pf.loadFromImages(PAGES);
      flip.current = pf;
    });
    return () => {
      gone = true;
      try {
        flip.current?.destroy();
      } catch {
        // already gone
      }
      flip.current = null;
      mount.remove();
    };
  }, []);

  // While on screen: turn to the next spread, then back, as in her file.
  useEffect(() => {
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let spread = 0;
    let dir = 1;
    let timer = 0;
    const tick = () => {
      const pf = flip.current;
      if (pf) {
        if (spread + dir > 2) dir = -1;
        if (spread + dir < 0) dir = 1;
        if (dir > 0) pf.flipNext();
        else pf.flipPrev();
        spread += dir;
      }
      timer = window.setTimeout(tick, TURN + HOLD);
    };
    try {
      flip.current?.turnToPage(0);
    } catch {
      // not loaded yet
    }
    timer = window.setTimeout(tick, HOLD);
    return () => window.clearTimeout(timer);
  }, [active]);

  return (
    <div ref={boxRef} className="sf" style={{ aspectRatio: `${W} / ${H}`, "--ar": W / H } as CSSProperties} role="img" aria-label={label}>
      <div className="sf-art" style={{ width: W, height: H, transform: `scale(${vw / W || 0})` }}>
        <img className="sf-head" src="/explore/strata/header.webp" alt="" width={2260} height={281} />
        <div ref={bookRef} className="sf-book" />
      </div>
    </div>
  );
}
