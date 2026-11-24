"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { play } from "@/lib/sound";

/*
  Something Eucharia is still building (Explorations, her current watch).
  It carries a small "soon" tag; pointing at it (or tapping) says it ships in
  v2 and that she is working on it. A tap anywhere else, Escape or a scroll
  puts it away again (phones never "blur" a tapped button, so that alone
  would leave it open), and the note never runs off the side of the screen.
*/
export default function Soon({ children, className = "", note = "I'm working on this. Shipping in v2." }: { children: ReactNode; className?: string; note?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const noteRef = useRef<HTMLSpanElement>(null);

  // Slide the note sideways if centring it under the word would push it past
  // either edge of the screen. Done on load too: even hidden, a note hanging
  // off the edge would make the page wider than a phone.
  const place = () => {
    const el = noteRef.current;
    if (!el) return;
    const gutter = 12;
    const nudge = parseFloat(el.style.getPropertyValue("--nudge")) || 0;
    const r = el.getBoundingClientRect();
    const left = r.left - nudge;
    const right = r.right - nudge;
    const vw = document.documentElement.clientWidth;
    let dx = 0;
    if (right > vw - gutter) dx = vw - gutter - right;
    if (left + dx < gutter) dx = gutter - left;
    el.style.setProperty("--nudge", `${Math.round(dx)}px`);
  };

  useLayoutEffect(() => {
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  const show = () => {
    place();
    setOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open]);

  return (
    <span
      ref={ref}
      className={`soon ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        show();
        play("tick");
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") setOpen(false);
      }}
    >
      <button type="button" className="soon-btn" aria-expanded={open} onClick={() => (open ? setOpen(false) : show())} onBlur={() => setOpen(false)}>
        {children}
        <span className="soon-tag">soon</span>
      </button>
      <span ref={noteRef} className={`soon-note${open ? " is-on" : ""}`} role="status">
        <span className="soon-dot" aria-hidden="true" />
        {note}
      </span>
    </span>
  );
}
