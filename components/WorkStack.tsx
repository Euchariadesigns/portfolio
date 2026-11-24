"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { projects } from "@/lib/projects";
import { play } from "@/lib/sound";
import ProjectIcon from "./ProjectIcon";
import Visual from "./visuals";

/*
  Work stack, after the reference recording: three cards at a time.
    top     the previous project, collapsed
    middle  the current project, open while the mouse is on the stack
    bottom  the next project, collapsed
  Other projects wait out of sight and fade in at the ends as the stack rolls.

  - The section is pinned while you scroll past it; each step of scrolling
    rolls the stack to the next project.
  - Until the mouse comes onto the stack, all three cards are collapsed.
  - Hovering a card opens it; hovering the top or bottom card rolls it into
    the middle first.
  - Clicking a collapsed card opens it (this is also how touch works).
    Clicking the open card goes to its case study.

  The open card is centred where the cards were, so after any roll the card
  you are pointing at still sits under the mouse: no hover ping-pong.
*/

type Geometry = {
  w: number; // open card width
  openH: number;
  openHead: number;
  pillH: number;
  sideW: number; // top and bottom cards
  awayW: number; // cards waiting out of sight
  gap: number; // between collapsed cards
  gapOpen: number; // around the open card
  pad: number; // content inset inside the open card
  step: number; // scroll distance per project
};

const even = (v: number) => Math.round(v / 2) * 2; // keeps -50% centring on whole pixels
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function measure(width: number, vh: number): Geometry {
  const w = even(Math.min(720, width));
  if (w >= 600) {
    const pillH = 72;
    const gapOpen = 16;
    return {
      w,
      openH: clamp(vh - 2 * (pillH + gapOpen) - 44 - 48, 380, 468),
      openHead: 84,
      pillH,
      sideW: even(w * 0.8),
      awayW: even(w * 0.7),
      gap: 16,
      gapOpen,
      pad: 28,
      // One scroll flick per project, so the pinned stretch stays short.
      step: clamp(vh * 0.2, 130, 170),
    };
  }
  const pillH = 60;
  const gapOpen = 12;
  return {
    w,
    openH: Math.round(clamp(vh - 2 * (pillH + gapOpen) - 44 - 32, 420, Math.min(580, w * 1.5))),
    openHead: 68,
    pillH,
    sideW: even(w * 0.86),
    awayW: even(w * 0.76),
    gap: 10,
    gapOpen,
    pad: 14,
    step: clamp(vh * 0.18, 120, 160),
  };
}

const META_H = 44; // the "Selected work" row, pinned with the cards

const SIDE_OPACITY = 0.72; // top and bottom cards are quieter than the open one
const HOVER_INTENT_MS = 90;
const ROLL_LOCK_MS = 650; // let a roll finish before hover can roll again
const LEAVE_MS = 240;
const ANCHOR_RADIUS = 36; // px the mouse must travel after a roll before hover counts again

export default function WorkStack() {
  const n = projects.length;
  const [current, setCurrent] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [entered, setEntered] = useState(false);
  const [firstRun, setFirstRun] = useState(true);
  const [geo, setGeo] = useState<Geometry>(() => measure(720, 900));
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const hitRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const state = useRef({ current: 0, open: false });
  const intent = useRef<number | null>(null);
  const leave = useRef<number | null>(null);
  const lockUntil = useRef(0);
  const mouse = useRef<{ x: number; y: number } | null>(null);
  const lastScrollStep = useRef<number | null>(null);
  const rollAnchor = useRef<{ x: number; y: number } | null>(null);

  state.current = { current, open: isOpen };

  const boxH = geo.openH + 2 * (geo.gapOpen + geo.pillH);
  const pinH = META_H + boxH;

  // Move the stack to project i (rolling if needed), and open or close it.
  const show = useCallback(
    (i: number, open: boolean, sound = false) => {
      const target = clamp(i, 0, n - 1);
      const s = state.current;
      if (s.current === target && s.open === open) return;
      if (s.current !== target) {
        lockUntil.current = performance.now() + ROLL_LOCK_MS;
        // After a roll, the next card can land right under a still mouse.
        // Hover stays quiet until the mouse really moves away from here.
        rollAnchor.current = mouse.current ? { ...mouse.current } : null;
      }
      if (sound && open) play("tick");
      setCurrent(target);
      setIsOpen(open);
    },
    [n],
  );

  const cancelIntent = () => {
    if (intent.current !== null) window.clearTimeout(intent.current);
    intent.current = null;
  };
  const cancelLeave = () => {
    if (leave.current !== null) window.clearTimeout(leave.current);
    leave.current = null;
  };

  // Where is the mouse? Runs on mouse move and on scroll.
  // fromScroll: the cards moved under a resting mouse. Then the project the
  // scroll has reached opens (Margin first), and the stack never jumps to
  // whichever card happens to be under the mouse.
  const syncToPointer = useCallback((fromScroll = false) => {
    const m = mouse.current;
    const stack = stackRef.current;
    if (!m || !stack) return;
    const box = stack.getBoundingClientRect();
    const inside = m.x >= box.left && m.x <= box.right && m.y >= box.top && m.y <= box.bottom;
    if (!inside) {
      cancelIntent();
      if (state.current.open && leave.current === null) {
        leave.current = window.setTimeout(() => {
          leave.current = null;
          show(state.current.current, false);
        }, LEAVE_MS);
      }
      return;
    }
    cancelLeave();
    if (fromScroll) {
      if (!state.current.open && intent.current === null) {
        intent.current = window.setTimeout(() => {
          intent.current = null;
          show(state.current.current, true, true);
        }, HOVER_INTENT_MS);
      }
      return;
    }
    const a = rollAnchor.current;
    if (a) {
      if (Math.hypot(m.x - a.x, m.y - a.y) < ANCHOR_RADIUS) return;
      rollAnchor.current = null;
    }
    const card = document.elementFromPoint(m.x, m.y)?.closest<HTMLElement>(".card");
    if (!card || !stack.contains(card) || card.dataset.slot === "away") return; // a gap: leave it be
    const i = Number(card.dataset.index);
    if (i === state.current.current && state.current.open) return;
    cancelIntent();
    intent.current = window.setTimeout(() => {
      intent.current = null;
      const wait = lockUntil.current - performance.now();
      if (wait > 0) {
        // A roll is still settling; look again once it has.
        window.setTimeout(() => syncToPointer(fromScroll), wait + 20);
        return;
      }
      show(i, true, true);
    }, HOVER_INTENT_MS);
  }, [show]);

  // The case-study button stretches into a labelled pill only when the mouse
  // comes near it. (On desktop the open card is always under the mouse, so
  // plain :hover would keep it stretched over the summary.)
  const syncGo = useCallback(() => {
    const m = mouse.current;
    const stack = stackRef.current;
    if (!stack) return;
    let near: Element | null = null;
    const go = stack.querySelector('.card[data-state="open"] .card-go');
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
    stack.querySelectorAll(".card[data-go]").forEach((c) => {
      if (c === near) return;
      c.removeAttribute("data-go");
      c.removeAttribute("data-wraps");
    });
    if (near && !near.hasAttribute("data-go")) {
      // The stretched pill needs room, so the pitch may move onto a second
      // line. If it does, the title and pitch rise together to stay centred.
      near.setAttribute("data-go", "");
      const pitch = near.querySelector<HTMLElement>(".card-summary");
      if (pitch && pitch.offsetHeight > 28) near.setAttribute("data-wraps", "");
    }
  }, []);

  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mouse.current = { x: e.clientX, y: e.clientY };
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        syncToPointer(false);
        syncGo();
      });
    };
    const onOut = () => {
      mouse.current = null;
      cancelIntent();
      syncGo();
      if (state.current.open) show(state.current.current, false);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onOut);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onOut);
    };
  }, [syncToPointer, syncGo, show]);

  // After the stack changes, the button may have moved to or from the mouse.
  useEffect(() => {
    const id = window.setTimeout(syncGo, 760);
    return () => window.clearTimeout(id);
  }, [current, isOpen, syncGo]);

  // Scrolling through the pinned section rolls the stack one project per step.
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const track = trackRef.current;
        if (!track) return;
        const r = track.getBoundingClientRect();
        if (r.top < window.innerHeight - 24) setEntered(true);
        const pinTop = Math.max(16, (window.innerHeight - pinH) / 2);
        const stepIdx = clamp(Math.round((pinTop - r.top) / geo.step), 0, n - 1);
        if (lastScrollStep.current === null) {
          lastScrollStep.current = stepIdx;
          return;
        }
        if (stepIdx !== lastScrollStep.current) {
          const delta = stepIdx - lastScrollStep.current;
          lastScrollStep.current = stepIdx;
          show(state.current.current + delta, state.current.open);
        }
        syncToPointer(true);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, [pinH, geo.step, n, show, syncToPointer]);

  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setGeo(measure(el.clientWidth, window.innerHeight));
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    if (!entered) return;
    const id = window.setTimeout(() => setFirstRun(false), 1400);
    return () => window.clearTimeout(id);
  }, [entered]);

  const onCardClick = (i: number) => (e: MouseEvent<HTMLAnchorElement>) => {
    const s = state.current;
    if (s.current === i && s.open) {
      play("tock");
      return; // follow the link to the case study
    }
    e.preventDefault();
    cancelIntent();
    show(i, true, true);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const s = state.current;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = clamp(s.current + (e.key === "ArrowDown" ? 1 : -1), 0, n - 1);
      show(next, true);
      hitRefs.current[next]?.focus({ preventScroll: true });
    } else if (e.key === "Escape") {
      show(s.current, false);
    }
  };

  // Positions from the top of the box. With nothing above (the first
  // project), the middle card moves up to the top.
  const hasTop = current > 0;
  const midH = isOpen ? geo.openH : geo.pillH;
  const around = isOpen ? geo.gapOpen : geo.gap;
  const midTop = hasTop ? geo.pillH + around : 0;
  const topY = midTop - around - geo.pillH;
  const botY = midTop + midH + around;

  // Once a card opens, the collapsed ones beside it get smaller and quieter.
  const sideW = geo.sideW;
  const sideO = SIDE_OPACITY;
  const place = (slot: number) => {
    if (!isOpen) {
      // Nothing open: all the projects, collapsed, as one list.
      const name = slot === 0 ? "mid" : slot === -1 ? "top" : slot === 1 ? "bottom" : "list";
      return { y: (current + slot) * (geo.pillH + geo.gap), h: geo.pillH, w: geo.w, o: 1, name };
    }
    if (slot === 0) return { y: midTop, h: midH, w: geo.w, o: 1, name: "mid" };
    if (slot === -1) return { y: topY, h: geo.pillH, w: sideW, o: sideO, name: "top" };
    if (slot === 1) return { y: botY, h: geo.pillH, w: sideW, o: sideO, name: "bottom" };
    // Waiting just beyond the ends, smaller and invisible, ready to fade in.
    const y = slot < 0 ? topY - geo.pillH * 0.6 : botY + geo.pillH * 0.6;
    return { y, h: geo.pillH, w: geo.awayW, o: 0, name: "away" };
  };

  return (
    <div className="stack-wrap" ref={wrapRef}>
      <div className="work-track" ref={trackRef} style={{ height: pinH + (n - 1) * geo.step }}>
      <div className="work-pin" style={{ height: pinH, top: `max(16px, calc(50vh - ${pinH / 2}px))` }}>
      <div className="stack-meta">
        <span className="eyebrow">Selected work</span>
        <span className="stack-meta-r">
        <a className="see-all" href="/work">
          See all work
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M3.5 8h9M8.5 4l4 4-4 4" />
          </svg>
        </a>
        </span>
      </div>

        <div
          ref={stackRef}
          className={`stack${entered ? " is-entered" : ""}${entered && firstRun ? " is-first" : ""}`}
          style={
            {
              height: boxH,
              "--pad": `${geo.pad}px`,
              "--open-head": `${geo.openHead}px`,
              "--pill-h": `${geo.pillH}px`,
            } as CSSProperties
          }
          role="region"
          aria-label="Selected work. Use the up and down arrow keys to move between projects."
          onKeyDown={onKeyDown}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node)) show(state.current.current, false);
          }}
        >
          {projects.map((p, i) => {
            const slot = i - current;
            const { y, h, w, o, name } = place(slot);
            const open = slot === 0 && isOpen;
            const away = name === "away";
            return (
              <article
                key={p.id}
                data-index={i}
                data-slot={name}
                data-state={open ? "open" : "pill"}
                className={`card tone-${p.tone} ink-${p.box.ink}`}
                aria-hidden={away || undefined}
                aria-label={`${p.title}, ${p.org}, ${p.year}`}
                style={
                  {
                    "--y": `${y}px`,
                    "--o": o,
                    "--w": `${w}px`,
                    "--h": `${h}px`,
                    "--r": `${open ? (geo.w >= 600 ? 32 : 26) : geo.pillH / 2}px`,
                    "--body-w": `${geo.w}px`,
                    "--body-h": `${geo.openH - geo.openHead}px`,
                    "--enter": `${(clamp(slot, -1, 1) + 1) * 90}ms`,
                    "--surface": p.surface.color,
                    "--box": p.box.color,
                    "--box-image": p.box.image,
                    "--box-size": p.box.size,
                    zIndex: slot === 0 ? 3 : away ? 1 : 2,
                  } as CSSProperties
                }
              >
                <a
                  ref={(el) => {
                    hitRefs.current[i] = el;
                  }}
                  className="card-hit"
                  href={p.href}
                  {...(p.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  tabIndex={away ? -1 : 0}
                  aria-label={open ? `${p.title}: open the case study` : `${p.title}: show project`}
                  onFocus={() => {
                    if (!(state.current.current === i && state.current.open)) show(i, true);
                  }}
                  onClick={onCardClick(i)}
                />

                <header className="card-head">
                  <ProjectIcon project={p} />
                  <div className="card-titles">
                    <span className="card-title">{p.title}</span>
                    <span className="card-summary">{p.summary}</span>
                  </div>
                  <div className="card-side">
                    <span className="card-meta">
                      {p.org} <span className="dot">·</span> {p.year}
                    </span>
                    <span className="card-go" aria-hidden="true">
                      <span className="card-go-label">View case study</span>
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
                  <Visual id={p.id} active={open && entered} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}
