"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { play } from "@/lib/sound";

/*
  Something Eucharia is still building (Explorations, her current watch).
  It carries a small "soon" tag; pointing at it (or tapping) says it ships in
  v2 and that she is working on it.
*/
export default function Soon({ children, className = "", note = "I'm working on this. Shipping in v2." }: { children: ReactNode; className?: string; note?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className={`soon ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType !== "mouse") return;
        setOpen(true);
        play("tick");
      }}
      onPointerLeave={() => setOpen(false)}
    >
      <button type="button" className="soon-btn" aria-describedby={undefined} onClick={() => setOpen((v) => !v)} onBlur={() => setOpen(false)}>
        {children}
        <span className="soon-tag">soon</span>
      </button>
      <span className={`soon-note${open ? " is-on" : ""}`} role="status">
        <span className="soon-dot" aria-hidden="true" />
        {note}
      </span>
    </span>
  );
}
