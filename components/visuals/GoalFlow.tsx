"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/*
  Goal Savings: one phone that plays through creating a first goal by itself,
  like a screen recording. A soft dot shows each tap, fields fill in, and the
  next screen slides in the way it does on iOS. Then it fades and starts over.

  The phone is drawn at 375 x 812 (the iPhone frame size in Figma) and zoomed
  to fit. Where the tile is wider than tall (desktop) the phone is larger than
  the tile, so the view glides up and down to follow the action. Where it fits
  (phones), it simply sits in the middle.

  The four screens below are rebuilt from the Goal Savings case study as a
  stand-in. Swap them for the exported Figma frames when they are in.
*/

const SW = 375;
const SH = 812;
const BEZEL = 7;
const TOP = 0; // focus values: which point of the screen to keep in view
const BOTTOM = SH;

const TITLE = "Rent an apartment";
const DESC = "Moving into my own place next year.";
const AMOUNT_KEYS = ["2", "5", "0", "0", "0", "0"];

const KEY_X = [73, 187, 301];
const KEY_Y = [478, 542, 606, 670];
const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"];
const keyAt = (k: string) => {
  const i = KEYPAD.indexOf(k);
  return { x: KEY_X[i % 3], y: KEY_Y[Math.floor(i / 3)] };
};

type Flow = {
  scr: number;
  focus: number;
  title: number;
  cat: boolean;
  desc: number;
  amount: string;
  date: boolean;
  caret: "title" | "desc" | null;
  tap: { x: number; y: number; k: number } | null;
  fade: boolean;
  still: boolean; // no transitions: used to snap back to the start
};

const START: Flow = {
  scr: 0,
  focus: TOP,
  title: 0,
  cat: false,
  desc: 0,
  amount: "",
  date: false,
  caret: null,
  tap: null,
  fade: false,
  still: false,
};

type Step = [number, (f: Flow) => Flow];

function buildScript() {
  const steps: Step[] = [];
  let t = 0;
  const at = (dt: number, fn: (f: Flow) => Flow) => {
    t += dt;
    steps.push([t, fn]);
  };
  const tap = (dt: number, x: number, y: number) =>
    at(dt, (f) => ({ ...f, tap: { x, y, k: (f.tap?.k ?? 0) + 1 } }));

  // 1. Intro. Read it, glide down, start.
  at(1500, (f) => ({ ...f, focus: BOTTOM }));
  tap(1300, 187, 758);
  at(280, (f) => ({ ...f, scr: 1, focus: TOP }));

  // 2. Name it, pick a category, say why.
  tap(1100, 187, 160);
  at(160, (f) => ({ ...f, caret: "title" }));
  for (let i = 1; i <= TITLE.length; i++) at(i === 1 ? 260 : 58, (f) => ({ ...f, title: i }));
  tap(700, 316, 240);
  at(240, (f) => ({ ...f, cat: true, caret: null }));
  tap(900, 187, 372);
  at(160, (f) => ({ ...f, caret: "desc" }));
  for (let i = 1; i <= DESC.length; i++) at(i === 1 ? 260 : 36, (f) => ({ ...f, desc: i }));
  at(600, (f) => ({ ...f, caret: null, focus: BOTTOM }));
  tap(1200, 187, 758);
  at(280, (f) => ({ ...f, scr: 2, focus: 430 }));

  // 3. How much, and by when.
  AMOUNT_KEYS.forEach((k, i) => {
    const { x, y } = keyAt(k);
    tap(i === 0 ? 1300 : 250, x, y);
    at(90, (f) => ({ ...f, amount: f.amount + k }));
  });
  tap(800, 316, 366);
  at(240, (f) => ({ ...f, date: true }));
  at(700, (f) => ({ ...f, focus: BOTTOM }));
  tap(1200, 187, 758);
  at(280, (f) => ({ ...f, scr: 3, focus: TOP }));

  // 4. The goal, created. Rest on it, then fade and start over.
  at(3200, (f) => ({ ...f, fade: true }));
  return { steps, total: t + 520 };
}

const SCRIPT = buildScript();

const money = (digits: string) => (digits ? Number(digits).toLocaleString("en-US") : "0");

export default function GoalFlow({ active, contain = false }: { active: boolean; contain?: boolean }) {
  const [flow, setFlow] = useState<Flow>(START);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = cellRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => timers.splice(0).forEach((id) => window.clearTimeout(id));

    if (!active) {
      setFlow({ ...START, still: true });
      return clear;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFlow(START);
      return clear;
    }

    const run = (delay: number) => {
      for (const [t, fn] of SCRIPT.steps) later(delay + t, () => setFlow(fn));
      later(delay + SCRIPT.total, () => {
        setFlow({ ...START, fade: true, still: true });
        later(60, () => setFlow(START));
        run(700);
      });
    };
    setFlow(START);
    run(900); // let the card finish opening first
    return clear;
  }, [active]);

  // Phone size and where the "camera" sits.
  let pw = 0;
  let camY = 0;
  if (box) {
    const portrait = contain || box.h > box.w * 1.1;
    const margin = contain ? Math.round(Math.min(64, Math.max(24, box.h * 0.09))) : portrait ? 20 : 26;
    pw = portrait
      ? Math.min(box.w * 0.72, ((box.h - 2 * margin - 2 * BEZEL) / SH) * SW + 2 * BEZEL)
      : Math.min(250, Math.max(190, box.h * 0.68));
    pw = Math.round(pw / 2) * 2;
    const s = (pw - 2 * BEZEL) / SW;
    const ph = SH * s + 2 * BEZEL;
    camY =
      ph + 2 * margin <= box.h
        ? (box.h - ph) / 2
        : Math.min(margin, Math.max(box.h - margin - ph, box.h / 2 - (BEZEL + flow.focus * s)));
    camY = Math.round(camY);
  }
  const s = (pw - 2 * BEZEL) / SW;

  const pos = (i: number) => (i < flow.scr ? "prev" : i > flow.scr ? "next" : "cur");
  const canGo1 = flow.title === TITLE.length && flow.cat;
  const canGo2 = flow.amount !== "" && flow.date;

  return (
    <div className="gf-cell-in" ref={cellRef}>
      {box && (
        <div className="gf-rig" data-move style={{ "--d": "60ms", "--from": "translateY(28px)", "--to": "none" } as CSSProperties}>
          <div
            className={`gf-cam${flow.still ? " is-still" : ""}`}
            style={{ "--pw": `${pw}px`, "--s": s, transform: `translate3d(-50%, ${camY}px, 0)` } as CSSProperties}
          >
            <div className="gf-phone">
              <div className={`gf-screen${flow.fade ? " is-fading" : ""}${flow.still ? " is-still" : ""}`}>
                {/* 1. Intro */}
                <section className="gf-scr gf-intro" data-pos={pos(0)} style={{ zIndex: 1 }}>
                  <span className="gf-x gf-x--r">
                    <IconX />
                  </span>
                  <div className="gf-art">
                    <img className="gf-hand-l" src="/work/goal-savings/hand-purse.svg" alt="" />
                    <img className="gf-hand-r" src="/work/goal-savings/hand-cash.svg" alt="" />
                    <img className="gf-spark" src="/work/goal-savings/sparkles.svg" alt="" />
                    <div className="gf-jar">
                      <span className="gf-coins">
                        <i />
                        <i />
                        <i />
                        <i />
                      </span>
                      <img src="/work/goal-savings/jar.svg" alt="" />
                    </div>
                    <span className="gf-bub b1">
                      <img src="/work/goal-savings/e1.png" alt="" />
                    </span>
                    <span className="gf-bub b2">
                      <img src="/work/goal-savings/e4.png" alt="" />
                    </span>
                    <span className="gf-bub b3">
                      <img src="/work/goal-savings/e5.png" alt="" />
                    </span>
                  </div>
                  <h4 className="gf-h1">Save for your goals</h4>
                  <p className="gf-lede">Set your savings goals, track your progress, and reach your financial milestones.</p>
                  <div className="gf-perks">
                    <div className="gf-perk">
                      <span className="gf-perk-i gf-perk-i--bonus">
                        <IconCoins />
                      </span>
                      <span>
                        <b>Earn up to 5% cash bonus, paid annually.</b>
                        <small>Only for goals set for 3 months or more.</small>
                      </span>
                    </div>
                    <div className="gf-perk">
                      <span className="gf-perk-i gf-perk-i--fee">
                        <IconMinus />
                      </span>
                      <span>
                        <b>10% penalty for breaking your goal</b>
                        <small>For withdrawals before your target date.</small>
                      </span>
                    </div>
                  </div>
                  <span className="gf-btn">Create a goal</span>
                </section>

                {/* 2. Name and category */}
                <section className="gf-scr" data-pos={pos(1)} style={{ zIndex: 2 }}>
                  <header className="gf-head">
                    <span />
                    <b>Create a goal</b>
                    <span className="gf-x">
                      <IconX />
                    </span>
                  </header>
                  <label className="gf-label" style={{ top: 112 }}>
                    Goal title
                  </label>
                  <div className={`gf-field${flow.caret === "title" ? " is-focus" : ""}`} style={{ top: 134 }}>
                    {flow.title > 0 ? (
                      <span>{TITLE.slice(0, flow.title)}</span>
                    ) : (
                      <span className="gf-ph">E.g. Rent an apartment</span>
                    )}
                    {flow.caret === "title" && <i className="gf-caret" />}
                  </div>
                  <div className="gf-pick" style={{ top: 204 }}>
                    <span className={`gf-pick-i${flow.cat ? " is-set" : ""}`}>
                      <IconGrid />
                      <img src="/work/goal-savings/e1.png" alt="" />
                    </span>
                    <span className="gf-swap">
                      <span className={flow.cat ? "" : "is-on"}>Choose a category</span>
                      <span className={flow.cat ? "is-on gf-strong" : ""}>Rent</span>
                    </span>
                    <span className="gf-pill">{flow.cat ? "Change" : "Choose"}</span>
                  </div>
                  <label className="gf-label" style={{ top: 302 }}>
                    Goal description <em>(Optional)</em>
                  </label>
                  <div className={`gf-field gf-area${flow.caret === "desc" ? " is-focus" : ""}`} style={{ top: 324 }}>
                    {flow.desc > 0 ? (
                      <span>{DESC.slice(0, flow.desc)}</span>
                    ) : (
                      <span className="gf-ph">What are you saving for?</span>
                    )}
                    {flow.caret === "desc" && <i className="gf-caret" />}
                  </div>
                  <span className={`gf-btn${canGo1 ? "" : " is-off"}`}>Continue</span>
                </section>

                {/* 3. Amount and date */}
                <section className="gf-scr" data-pos={pos(2)} style={{ zIndex: 3 }}>
                  <header className="gf-head">
                    <span className="gf-x">
                      <IconBack />
                    </span>
                    <b>Create a goal</b>
                    <span className="gf-x">
                      <IconX />
                    </span>
                  </header>
                  <p className="gf-ask">How much do you need for this goal?</p>
                  <div className="gf-amount">
                    <small>XAF</small>
                    <b>{money(flow.amount)}</b>
                  </div>
                  <span className="gf-monthly">
                    Monthly basis <b>{flow.amount && flow.date ? "25,000" : "0"} XAF</b>
                    <IconChevron />
                  </span>
                  <div className="gf-pick" style={{ top: 330 }}>
                    <span className="gf-pick-i is-cal">
                      <IconCal />
                    </span>
                    <span className="gf-two">
                      <small>When should it be done?</small>
                      <span className="gf-swap">
                        <span className={flow.date ? "" : "is-on"}>Choose a target date</span>
                        <span className={flow.date ? "is-on" : ""}>September 17, 2025</span>
                      </span>
                    </span>
                    <span className="gf-pill">{flow.date ? "Change" : "Choose"}</span>
                  </div>
                  <div className="gf-keys">
                    {KEYPAD.map((k) => (
                      <span key={k} className="gf-key">
                        {k === "del" ? <IconDel /> : k}
                      </span>
                    ))}
                  </div>
                  <span className={`gf-btn${canGo2 ? "" : " is-off"}`}>Continue</span>
                </section>

                {/* 4. Goal details */}
                <section className="gf-scr gf-done" data-pos={pos(3)} style={{ zIndex: 4 }}>
                  <header className="gf-head">
                    <span className="gf-x">
                      <IconBack />
                    </span>
                    <b>Goal details</b>
                    <span />
                  </header>
                  <span className="gf-goal-i">
                    <img src="/work/goal-savings/e1.png" alt="" />
                  </span>
                  <h4 className="gf-goal-t">Rent an apartment</h4>
                  <p className="gf-goal-m">
                    250,000 XAF <i>•</i> Sep 17, 2025
                  </p>
                  <span className="gf-bar">
                    <i />
                  </span>
                  <div className="gf-saved">
                    <small>Amount saved</small>
                    <b>
                      0 <i>XAF</i>
                    </b>
                    <span className="gf-pct">0%</span>
                    <span className="gf-save">
                      <IconPlus /> Save
                    </span>
                    <span className="gf-more">•••</span>
                  </div>
                  <div className="gf-row">
                    <span className="gf-row-i">
                      <IconCoins />
                    </span>
                    <span>
                      <b>Cash bonus</b>
                      <small>Your savings earn bonuses!</small>
                    </span>
                    <span className="gf-view">View</span>
                  </div>
                  <div className="gf-row gf-row--auto">
                    <span className="gf-row-i">
                      <IconRepeat />
                    </span>
                    <span>
                      <b>Let autosave handle it!</b>
                      <small>Start autosaving effortlessly!</small>
                    </span>
                    <span className="gf-view">Learn more</span>
                  </div>
                </section>

                {/* Always on top: status bar, island, home bar, and the tap. */}
                <div className="gf-status">
                  <span>14:45</span>
                  <span className="gf-status-r">
                    <IconSignal />
                    <IconWifi />
                    <span className="gf-batt" />
                  </span>
                </div>
                <span className="gf-island" />
                <span className="gf-home" />
                {flow.tap && <span key={flow.tap.k} className="gf-tap" style={{ left: flow.tap.x, top: flow.tap.y }} />}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ Icons */

const svg = { viewBox: "0 0 24 24", "aria-hidden": true } as const;

function IconX() {
  return (
    <svg {...svg}>
      <path d="M7 7l10 10M17 7 7 17" />
    </svg>
  );
}
function IconBack() {
  return (
    <svg {...svg}>
      <path d="M19 12H5m6-6-6 6 6 6" />
    </svg>
  );
}
function IconChevron() {
  return (
    <svg {...svg}>
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}
function IconPlus() {
  return (
    <svg {...svg}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function IconMinus() {
  return (
    <svg {...svg}>
      <path d="M6 12h12" />
    </svg>
  );
}
function IconGrid() {
  return (
    <svg {...svg}>
      <rect x="4" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="4" width="6.5" height="6.5" rx="2" />
      <rect x="4" y="13.5" width="6.5" height="6.5" rx="2" />
      <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="2" />
    </svg>
  );
}
function IconCal() {
  return (
    <svg {...svg}>
      <rect x="3.5" y="5" width="17" height="15" rx="3.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  );
}
function IconCoins() {
  return (
    <svg {...svg}>
      <ellipse cx="12" cy="6.5" rx="6.5" ry="2.5" />
      <path d="M5.5 6.5v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4M5.5 10.5v4c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-4M5.5 14.5v3c0 1.4 2.9 2.5 6.5 2.5s6.5-1.1 6.5-2.5v-3" />
    </svg>
  );
}
function IconRepeat() {
  return (
    <svg {...svg}>
      <path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4" />
    </svg>
  );
}
function IconDel() {
  return (
    <svg {...svg}>
      <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7z" />
      <path d="m12 9.5 5 5m0-5-5 5" />
    </svg>
  );
}
function IconSignal() {
  return (
    <svg viewBox="0 0 18 12" aria-hidden="true" className="gf-sig">
      <rect x="0" y="8" width="3" height="4" rx="0.8" />
      <rect x="5" y="5.5" width="3" height="6.5" rx="0.8" />
      <rect x="10" y="3" width="3" height="9" rx="0.8" />
      <rect x="15" y="0" width="3" height="12" rx="0.8" />
    </svg>
  );
}
function IconWifi() {
  return (
    <svg viewBox="0 0 16 12" aria-hidden="true" className="gf-wifi">
      <path d="M8 11.5 5.6 9a3.4 3.4 0 0 1 4.8 0L8 11.5zM3.4 6.8a6.5 6.5 0 0 1 9.2 0l-1.4 1.4a4.5 4.5 0 0 0-6.4 0L3.4 6.8zM1.2 4.6a9.6 9.6 0 0 1 13.6 0l-1.4 1.4a7.6 7.6 0 0 0-10.8 0L1.2 4.6z" />
    </svg>
  );
}
