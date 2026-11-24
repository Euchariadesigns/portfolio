"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { play } from "@/lib/sound";

/*
  A highlighted word in the intro (like the chips on Bimanshu's page). Point
  at it and a picture of the thing rises above it; click to open it.
*/
export default function Peek({
  href,
  icon,
  tone,
  preview,
  children,
}: {
  href: string;
  icon?: string;
  /** The chip's colour: its text, and a soft tint of it behind. */
  tone: string;
  preview: ReactNode;
  children: ReactNode;
}) {
  const chip = useRef<HTMLAnchorElement>(null);
  const card = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Sit centred above the chip, or below it if there is no room above.
  const place = () => {
    const c = chip.current?.getBoundingClientRect();
    const el = card.current;
    if (!c || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const x = Math.min(window.innerWidth - w - 12, Math.max(12, c.left + c.width / 2 - w / 2));
    const y = c.top - h - 14 < 8 ? c.bottom + 14 : c.top - h - 14;
    el.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
  };

  useEffect(() => {
    if (!on) return;
    place();
    const onScroll = () => place();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [on]);

  const external = href.startsWith("http");
  return (
    <>
      <a
        ref={chip}
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="chip"
        style={{ "--tone": tone } as React.CSSProperties}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          setOn(true);
          play("tick");
        }}
        onPointerLeave={() => setOn(false)}
        onFocus={() => setOn(true)}
        onBlur={() => setOn(false)}
      >
        {icon ? <img className="chip-icon" src={icon} alt="" /> : null}
        {children}
      </a>
      {mounted &&
        createPortal(
          <span ref={card} className={`pk-card${on ? " is-on" : ""}`} aria-hidden="true">
            <span className="pk-inner">{preview}</span>
          </span>,
          document.body,
        )}
    </>
  );
}
