"use client";

import { useEffect, useRef } from "react";

/*
  The cursor: a small orange petal that sits exactly on the pointer. No trail,
  no lag. It spins once on click.
  Mouse and trackpad only; touch keeps the system behaviour, and without
  JavaScript the same petal is the native cursor (public/cursor.svg).
*/
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mark = ref.current;
    if (!mark || !window.matchMedia("(pointer: fine)").matches) return;
    const body = document.body;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mark.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      if (!body.classList.contains("has-cursor")) body.classList.add("has-cursor");
      mark.classList.remove("gone");
    };
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mark.classList.remove("spin");
      void mark.offsetWidth; // restart cleanly when clicking mid-spin
      mark.classList.add("spin");
    };
    const onEnd = () => mark.classList.remove("spin");
    const onLeave = () => mark.classList.add("gone");

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    mark.addEventListener("animationend", onEnd);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      mark.removeEventListener("animationend", onEnd);
      body.classList.remove("has-cursor");
    };
  }, []);

  return (
    <div ref={ref} className="cursor-mark" aria-hidden="true">
      <svg viewBox="0 0 20 20">
        <circle cx="10" cy="6.3" r="3.6" />
        <circle cx="13.5" cy="8.9" r="3.6" />
        <circle cx="12.2" cy="13" r="3.6" />
        <circle cx="7.8" cy="13" r="3.6" />
        <circle cx="6.5" cy="8.9" r="3.6" />
        <circle cx="10" cy="10" r="3.2" />
      </svg>
    </div>
  );
}
