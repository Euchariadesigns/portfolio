"use client";

import { Check, Copy, EnvelopeSimple } from "@phosphor-icons/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { play } from "@/lib/sound";

/*
  "Say hi": a plain mailto link does nothing on computers without a mail app
  set up, so this opens a small menu instead: the address, Copy, Gmail, and
  the mail app.
*/
export const EMAIL = "odilieucharia1@gmail.com";
const GMAIL = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent("Hi Eucharia")}`;

export default function SayHi({ children, className = "", icon = true }: { children: ReactNode; className?: string; icon?: boolean }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const menuRef = useRef<HTMLSpanElement>(null);

  // Keep the menu inside the screen: on a phone "Say hi" sits near the right
  // edge, and a menu hanging past it would zoom the whole page out.
  useLayoutEffect(() => {
    const m = menuRef.current;
    if (!open || !m) return;
    m.style.left = "";
    const gutter = 14;
    const vw = document.documentElement.clientWidth;
    const r = m.getBoundingClientRect();
    let dx = 0;
    if (r.right > vw - gutter) dx = vw - gutter - r.right;
    if (r.left + dx < gutter) dx = gutter - r.left;
    if (dx) m.style.left = `${parseFloat(getComputedStyle(m).left) + dx}px`;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      play("tock");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the address is shown, so it can be copied by hand */
    }
  };

  return (
    <span className={`hi-say ${className}`} ref={ref}>
      <button
        type="button"
        className="hi-say-btn"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => {
          setOpen((v) => !v);
          play("tick");
        }}
      >
        {children}
        {icon ? <EnvelopeSimple aria-hidden="true" /> : null}
      </button>
      {open ? (
        <span className="hi-say-menu" ref={menuRef} role="dialog" aria-label="Email Eucharia">
          <span className="hi-say-addr">{EMAIL}</span>
          <span className="hi-say-actions">
            <button type="button" onClick={copy}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copied" : "Copy"}
            </button>
            <a href={GMAIL} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}>
              Gmail
            </a>
            <a href={`mailto:${EMAIL}`} onClick={() => setOpen(false)}>
              Mail app
            </a>
          </span>
        </span>
      ) : null}
    </span>
  );
}
