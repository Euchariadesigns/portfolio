"use client";

import { useEffect, useRef } from "react";

/*
  The cursor: a small orange petal that sits exactly on the pointer. No trail,
  no lag. It spins once on click. Over anything with a data-cursor attribute
  it carries a small label saying what a click does (e.g. "Click to open").
  Mouse and trackpad only; touch keeps the system behaviour, and without
  JavaScript the same petal is the native cursor (public/cursor.svg).
*/
export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mark = ref.current;
    const hint = hintRef.current;
    if (!mark || !hint || !window.matchMedia("(pointer: fine)").matches) return;
    const body = document.body;
    let label = "";
    let at: { x: number; y: number } | null = null;
    let frame = 0;

    const setHint = (el: Element | null) => {
      const next = el?.closest?.("[data-cursor]")?.getAttribute("data-cursor") ?? "";
      if (next === label) return;
      label = next;
      if (next) hint.textContent = next;
      mark.classList.toggle("has-hint", !!next);
    };
    // After a click or a scroll, what is under a still pointer may change.
    const recheck = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => at && setHint(document.elementFromPoint(at.x, at.y)));
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mark.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      at = { x: e.clientX, y: e.clientY };
      setHint(e.target as Element);
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
    const onUp = () => recheck();
    const onLeave = () => mark.classList.add("gone");

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", recheck, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    mark.addEventListener("animationend", onEnd);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", recheck);
      cancelAnimationFrame(frame);
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
      <span ref={hintRef} className="cursor-hint" />
    </div>
  );
}
