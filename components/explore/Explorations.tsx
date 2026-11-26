"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import type { Exploration } from "@/lib/explorations";
import AvelisFlow from "./AvelisFlow";
import ExomailFlow from "./ExomailFlow";
import HomelandFlow from "./HomelandFlow";
import NutrientubFlow from "./NutrientubFlow";
import StrataFlip from "./StrataFlip";

/*
  The explorations, as small windows (like Cindy Ly's): a title bar with the
  three dots and a file name, and the idea playing inside. Laid out as her
  grid is: three columns of 1px rows, each window spanning as many rows as it
  is tall (plus the gap), packed densely. Clicking one opens
  a bigger window over the page (blurred behind): the idea on the left, and
  what it is, the tools and a short "about" on the right. The red dot, a
  click outside or Escape closes it.
*/

function Media({ id, active, label }: { id: Exploration["id"]; active: boolean; label: string }) {
  if (id === "exomail") return <ExomailFlow active={active} label={label} />;
  if (id === "avelis") return <AvelisFlow active={active} label={label} />;
  if (id === "strata") return <StrataFlip active={active} label={label} />;
  if (id === "nutrientub") return <NutrientubFlow active={active} label={label} />;
  if (id === "homeland") return <HomelandFlow active={active} label={label} />;
  return null;
}

// Plays only while on screen.
function useInView<T extends Element>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, inView] as const;
}

const GAP = 16;

function Tile({ x, cols, paused, onOpen }: { x: Exploration; cols: number; paused: boolean; onOpen: (el: HTMLButtonElement) => void }) {
  const [ref, inView] = useInView<HTMLButtonElement>();
  const hint = useRef<HTMLSpanElement>(null);
  const [rows, setRows] = useState(0);

  // As tall as the window is, in 1px rows, plus the gap under it.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setRows(Math.ceil(el.getBoundingClientRect().height) + GAP));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  // "Click to open" rides beside the pointer while it is over the window.
  // Moved directly (no re-render), so the recording inside keeps playing smoothly.
  const follow = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = hint.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = Math.min(e.clientX - r.left + 16, r.width - el.offsetWidth - 10);
    const y = Math.min(e.clientY - r.top + 18, r.height - el.offsetHeight - 10);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    el.classList.add("is-on");
  };
  const leave = () => hint.current?.classList.remove("is-on");

  return (
    <li className={`xp-item xp-item--${x.size}`} style={{ "--span": cols, gridRowEnd: rows ? `span ${rows}` : undefined } as CSSProperties}>
      <button
        ref={ref}
        type="button"
        className="xp-win xp-tile"
        onClick={(e) => onOpen(e.currentTarget)}
        onPointerMove={follow}
        onPointerLeave={leave}
        aria-label={`${x.title}: open`}
      >
        <span className="xp-bar" aria-hidden="true">
          <span className="xp-dots">
            <i />
            <i />
            <i />
          </span>
          <span className="xp-file">{x.file}</span>
        </span>
        <span className="xp-media">
          <Media id={x.id} active={inView && !paused} label={x.title} />
        </span>
        <span ref={hint} className="xp-hint" aria-hidden="true">
          Click to open
        </span>
      </button>
    </li>
  );
}

export default function Explorations({ items }: { items: Exploration[] }) {
  const [open, setOpen] = useState<Exploration | null>(null);
  const [shown, setShown] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // A wide window takes two columns when a phone comes right after it, else all three.
  const span = (x: Exploration) => {
    if (x.size === "tall") return 1;
    const next = items[items.indexOf(x) + 1];
    return next?.size === "tall" ? 2 : 3;
  };

  const show = (x: Exploration, el: HTMLButtonElement) => {
    opener.current = el;
    setOpen(x);
    requestAnimationFrame(() => setShown(true));
  };

  const close = () => {
    setShown(false);
    window.setTimeout(() => {
      setOpen(null);
      opener.current?.focus();
    }, 220);
  };

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <ul className="xp-grid">
        {items.map((x) => (
          <Tile key={x.id} x={x} cols={span(x)} paused={open !== null} onOpen={(el) => show(x, el)} />
        ))}
      </ul>

      {open && (
        <div className={`xp-modal${shown ? " is-on" : ""}`} onPointerDown={(e) => e.target === e.currentTarget && close()}>
          <div className="xp-win xp-window" role="dialog" aria-modal="true" aria-labelledby="xp-title">
            <span className="xp-bar">
              <span className="xp-dots xp-dots--live">
                <button ref={closeRef} type="button" onClick={close} aria-label="Close" />
                <i />
                <i />
              </span>
              <span className="xp-file">{open.file}</span>
            </span>
            <div className="xp-window-body">
              <div className="xp-stage">
                <Media id={open.id} active={shown} label={open.title} />
              </div>
              <div className="xp-about">
                <h2 id="xp-title">{open.title}</h2>
                <dl>
                  <div>
                    <dt>Type</dt>
                    <dd>{open.kind}</dd>
                  </div>
                  <div>
                    <dt>Tools</dt>
                    <dd>{open.tools}</dd>
                  </div>
                </dl>
                <p>{open.about}</p>
                {open.link ? (
                  <a className="xp-link" href={open.link.href} target="_blank" rel="noreferrer">
                    {open.link.label}
                    <ArrowUpRight aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
