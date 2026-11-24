"use client";

import { CaretDown } from "@phosphor-icons/react";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { projects } from "@/lib/projects";
import { play } from "@/lib/sound";
import ProjectIcon from "./ProjectIcon";
import Visual from "./visuals";

/*
  Selected work: one card per project, all collapsed when the page opens.
  - Click a collapsed card to open it; a card that was open closes.
  - Click the open card (or its arrow button) to go to the case study.
  - A tap or click anywhere outside the list closes the open card (a scroll
    or a text selection does not).
  - Hovering never opens a card. Over a collapsed one, the year on the right
    gives way to a small "Click to open" label (CSS only, so it shows in
    every browser).
  The list scrolls with the page; nothing is pinned. When a card opens, the
  card you clicked stays where it was under the pointer, and the page eases
  down just enough to show it whole. On phones the open card's tiles stack
  in one column, so each card is as tall as its own tiles (measured below).
*/

type Geo = {
  w: number; // card width
  openH: number; // open card height (computers; phones measure each card)
  pillH: number; // collapsed card height (from CSS)
  openHead: number; // header height of the open card (from CSS)
  phone: boolean;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// The cards' height moves on the same curve and timing as the header's CSS
// (--ease-soft, --move and --lag in globals.css), so they move as one.
const MOVE_MS = 700;
const LAG_MS = 90;

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;
    let lo = 0;
    let hi = 1;
    let t = p;
    for (let i = 0; i < 24; i++) {
      t = (lo + hi) / 2;
      if (at(x1, x2, t) < p) lo = t;
      else hi = t;
    }
    return at(y1, y2, t);
  };
}
const easeSoft = cubicBezier(0.5, 0, 0.2, 1);

function readGeo(list: HTMLElement): Geo {
  const cs = getComputedStyle(list);
  const pillH = parseFloat(cs.getPropertyValue("--pill-h")) || 72;
  const openHead = parseFloat(cs.getPropertyValue("--open-head")) || 84;
  const w = Math.round(list.getBoundingClientRect().width);
  const vh = window.innerHeight;
  const phone = window.matchMedia("(max-width: 600px)").matches;
  const openH = phone ? Math.round(clamp(vh - 220, 420, Math.min(580, w * 1.5))) : Math.round(clamp(vh - 268, 380, 468));
  return { w, openH, pillH, openHead, phone };
}

const sameGeo = (a: Geo | null, b: Geo) =>
  !!a && a.w === b.w && a.openH === b.openH && a.pillH === b.pillH && a.openHead === b.openHead && a.phone === b.phone;

export default function WorkStack() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLElement | null)[]>([]);
  // What stays put on screen while the heights change: the card being
  // opened, or whatever was tapped below a card that is closing.
  const hold = useRef<{ el: HTMLElement; opening: boolean } | null>(null);
  const raf = useRef(0);
  const placed = useRef(false);
  const mouse = useRef<{ x: number; y: number } | null>(null);

  // Card sizes follow the list's width and the window's height.
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const update = () => {
      const next = readGeo(list);
      setGeo((prev) => (sameGeo(prev, next) ? prev : next));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Open and close: every card's height eases to its new size together.
  useLayoutEffect(() => {
    if (!geo) return;
    const els = cards.current;
    // An open card is its header plus its tiles. On computers that is the
    // shared height; on phones each card's own (its body sizes itself).
    const openHeight = (i: number) => {
      const body = els[i]?.querySelector<HTMLElement>(".card-body");
      return body && body.offsetHeight ? Math.round(geo.openHead + body.offsetHeight) : geo.openH;
    };
    const to = projects.map((_, i) => (i === openIdx ? openHeight(i) : geo.pillH));
    cancelAnimationFrame(raf.current);
    const held = hold.current;
    hold.current = null;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!placed.current || reduce) {
      placed.current = true;
      els.forEach((e, i) => {
        if (e) e.style.height = `${to[i]}px`;
      });
      return;
    }

    const from = els.map((e) => (e ? e.getBoundingClientRect().height : 0));
    let holdEl = held ? held.el : null;
    const top0 = holdEl ? holdEl.getBoundingClientRect().top : 0;
    // How far the page eases down so the card that opened ends up whole (or,
    // if it is taller than the screen, with its top near the top).
    let lift = 0;
    if (holdEl && held?.opening && openIdx !== null) {
      const margin = geo.phone ? 12 : 24;
      lift = clamp(top0 + to[openIdx] - (window.innerHeight - margin), 0, Math.max(0, top0 - margin));
    }
    // If the reader scrolls during the move, let them: stop holding the card.
    const release = () => {
      holdEl = null;
    };
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchmove", release, { passive: true });

    const t0 = performance.now() + LAG_MS;
    const frame = (now: number) => {
      const p = clamp((now - t0) / MOVE_MS, 0, 1);
      const k = easeSoft(p);
      els.forEach((e, i) => {
        if (e) e.style.height = `${from[i] + (to[i] - from[i]) * k}px`;
      });
      if (holdEl) {
        const want = top0 - lift * k;
        const d = holdEl.getBoundingClientRect().top - want;
        if (Math.abs(d) >= 0.5) window.scrollBy({ top: d, behavior: "instant" });
      }
      if (p < 1) raf.current = requestAnimationFrame(frame);
    };
    raf.current = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchmove", release);
    };
  }, [openIdx, geo]);

  const onHit = (i: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return; // opening in a new tab
    if (openIdx === i) {
      play("tock");
      return; // the open card: follow the link to the case study
    }
    e.preventDefault();
    const card = cards.current[i];
    hold.current = card ? { el: card, opening: true } : null;
    play("tick");
    setOpenIdx(i);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && openIdx !== null) {
      setOpenIdx(null);
    }
  };

  // A tap or click outside the list closes the open card. Pointer events,
  // not click: iPhones send no click for a tap on plain text. A press that
  // moves (a scroll, a text selection) or lingers is not a tap.
  useEffect(() => {
    if (openIdx === null) return;
    let start: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      start = { x: e.clientX, y: e.clientY, t: e.timeStamp };
    };
    const onCancel = () => {
      start = null;
    };
    const onUp = (e: PointerEvent) => {
      const s = start;
      start = null;
      if (!s || Math.hypot(e.clientX - s.x, e.clientY - s.y) > 10 || e.timeStamp - s.t > 600) return;
      const list = listRef.current;
      const target = e.target instanceof Element ? e.target : null;
      if (!list || !target || list.contains(target)) return;
      // Whatever was tapped below the open card would slide up as it closes:
      // keep it where it is.
      const card = cards.current[openIdx];
      const el = target.closest<HTMLElement>("*");
      if (card && el && el.getBoundingClientRect().top >= card.getBoundingClientRect().bottom - 1) {
        hold.current = { el, opening: false };
      }
      setOpenIdx(null);
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onCancel, { passive: true });
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onCancel);
    };
  }, [openIdx]);

  // The case-study button stretches into a labelled pill when the mouse
  // comes near it; the pitch may then move onto a second line, and if it
  // does, the title and pitch rise together to stay centred.
  const syncGo = useCallback(() => {
    const m = mouse.current;
    const list = listRef.current;
    if (!list) return;
    let near: Element | null = null;
    const go = list.querySelector('.card[data-state="open"] .card-go');
    if (m && go) {
      const r = go.getBoundingClientRect();
      const card = go.closest(".card");
      const pad = 14;
      // Wakes on the circle; once stretched, stays while over the whole pill.
      const reach = card?.hasAttribute("data-go") ? 116 : 0;
      if (m.x >= r.left - pad - reach && m.x <= r.right + pad && m.y >= r.top - pad && m.y <= r.bottom + pad) {
        near = card ?? null;
      }
    }
    list.querySelectorAll(".card[data-go]").forEach((c) => {
      if (c === near) return;
      c.removeAttribute("data-go");
      c.removeAttribute("data-wraps");
    });
    if (near && !near.hasAttribute("data-go")) {
      near.setAttribute("data-go", "");
      const pitch = near.querySelector<HTMLElement>(".card-summary");
      if (pitch && pitch.offsetHeight > 28) near.setAttribute("data-wraps", "");
    }
  }, []);

  useEffect(() => {
    let frame = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncGo);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(syncGo);
    };
    const onOut = () => {
      mouse.current = null;
      syncGo();
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("mouseleave", onOut);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("mouseleave", onOut);
    };
  }, [syncGo]);

  // Once a card has opened, the button may have landed under the mouse.
  useEffect(() => {
    const id = window.setTimeout(syncGo, MOVE_MS + LAG_MS);
    return () => window.clearTimeout(id);
  }, [openIdx, syncGo]);

  return (
    <div className="stack-wrap">
      <div className="stack-meta">
        <span className="eyebrow">Selected work</span>
        <span className="stack-meta-r">
          <Link className="see-all" href="/work">
            See all work
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M3.5 8h9M8.5 4l4 4-4 4" />
            </svg>
          </Link>
        </span>
      </div>

      <div
        ref={listRef}
        className="acc"
        style={
          geo
            ? ({ "--body-w": `${geo.w}px`, "--body-h": `${geo.openH - geo.openHead}px` } as CSSProperties)
            : undefined
        }
        onKeyDown={onKeyDown}
      >
        {projects.map((p, i) => {
          const open = openIdx === i;
          const external = p.href.startsWith("http");
          return (
            <article
              key={p.id}
              ref={(el) => {
                cards.current[i] = el;
              }}
              data-index={i}
              data-state={open ? "open" : "pill"}
              className={`card tone-${p.tone} ink-${p.box.ink}`}
              aria-label={`${p.title}, ${p.org}, ${p.year}`}
              style={
                {
                  "--surface": p.surface.color,
                  "--box": p.box.color,
                  "--box-image": p.box.image,
                  "--box-size": p.box.size,
                } as CSSProperties
              }
            >
              <Link
                className="card-hit"
                href={p.href}
                {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                aria-expanded={open}
                aria-label={open ? `${p.title}: ${external ? "open the app" : "open the case study"}` : `${p.title}: show project`}
                onClick={onHit(i)}
              />

              <header className="card-head">
                <ProjectIcon project={p} />
                <div className="card-titles">
                  <span className="card-title">{p.title}</span>
                  <span className="card-summary">{p.summary}</span>
                </div>
                <div className="card-side">
                  <span className="card-hint" aria-hidden="true">
                    Click to open
                    <CaretDown weight="bold" />
                  </span>
                  <span className="card-meta">
                    {p.org} <span className="dot">·</span> {p.year}
                  </span>
                  <span className="card-go" aria-hidden="true">
                    <span className="card-go-label">{external ? "Try the app" : "View case study"}</span>
                    <span className="card-go-icon">
                      <svg viewBox="0 0 16 16">
                        <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
                      </svg>
                      <svg viewBox="0 0 16 16">
                        <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
                      </svg>
                    </span>
                  </span>
                </div>
              </header>

              <div className="card-body" aria-hidden={!open}>
                <Visual id={p.id} active={open} />
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
