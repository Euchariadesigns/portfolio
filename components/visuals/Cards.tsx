"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

/*
  Savings Box, Group Goal Savings and Bond Investment, told one card at a
  time, like the covers on Jenn Choi's work: in a single space, a card comes
  in and builds itself, holds, then makes way for the next. It loops while
  the card (or work page tile) is open.

  Each scene is a stage the size of the tile the card was designed for, so
  every card keeps its look; the stage sits in the middle of the space.
  Inside a scene:
    data-in    fades in from a soft blur
    data-move  fades in while easing from --from to --to
  Both start when the scene comes on, staggered by --d.
*/

type VProps = { active: boolean };

const d = (ms: number, extra: Record<string, string | number> = {}) =>
  ({ "--d": `${ms}ms`, ...extra }) as CSSProperties;

const mv = (ms: number, from: string, to = "none") => d(ms, { "--from": from, "--to": to });

function Count({ to, active, delay = 1200, duration = 1400 }: { to: number; active: boolean; delay?: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now() + delay;
    const tick = (t: number) => {
      const p = Math.min(1, Math.max(0, (t - start) / duration));
      setValue(Math.round(to * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, to, delay, duration]);
  return <>{value.toLocaleString("en-US")}</>;
}

/* ------------------------------------------------------------------ Scenes */

type Scene = {
  /** How long it stays, in ms. */
  hold: number;
  /** The stage: the size of the tile the card was designed for. */
  w: number;
  h: number;
  className?: string;
  render: (on: boolean) => ReactNode;
};

function Scenes({ id, active, scenes }: { id: string; active: boolean; scenes: Scene[] }) {
  const [i, setI] = useState(-1);
  const [out, setOut] = useState(-1);

  useEffect(() => {
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => timers.splice(0).forEach((t) => window.clearTimeout(t));
    if (!active) {
      setI(-1);
      setOut(-1);
      return clear;
    }
    later(260, () => setI(0));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return clear;
    const next = (k: number, at: number) => {
      later(at, () => {
        const n = (k + 1) % scenes.length;
        setOut(k);
        setI(n);
        later(650, () => setOut(-1));
        next(n, scenes[n].hold);
      });
    };
    next(0, 260 + scenes[0].hold);
    return clear;
  }, [active, scenes]);

  return (
    <div className={`v v-scenes v-${id}${active ? " on" : ""}`}>
      <div className="cell a-g">
        {scenes.map((s, k) => {
          const on = k === i;
          const state = on ? "on" : k === out ? "out" : "off";
          return (
            <div key={k} className={`sc${on || k === out ? " play" : ""}`} data-state={state} aria-hidden={!on}>
              <div className={`sc-stage ${s.className ?? ""}`} style={{ width: s.w, height: s.h }}>
                {s.render(on)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// A phone, on its own, filling most of the space's height.
function PhoneScene({ src }: { src: string }) {
  return <img className="sc-phone" src={src} alt="" loading="lazy" decoding="async" data-move style={mv(0, "translateY(36px)")} />;
}

/* ============================================================= Savings Box */

const BOX: Scene[] = [
  { hold: 2600, w: 240, h: 440, className: "sc-phonestage", render: () => <PhoneScene src="/work/savings-box/phone.png" /> },
  {
    hold: 2400,
    w: 370,
    h: 170,
    className: "sb-notif",
    render: () => (
      <>
        <span className="sb-ghost" data-move style={mv(220, "translateX(-24px)")} />
        <div className="sb-card" data-move style={mv(80, "translateX(-24px)")}>
          <span className="sb-cal">
            <svg viewBox="0 0 24 24">
              <rect x="3.5" y="5" width="17" height="15" rx="3.5" />
              <path d="M3.5 10h17M8 3v4M16 3v4" />
            </svg>
            <em>1</em>
          </span>
          <span>
            <b>Next free withdrawal</b>
            <small>Next quarter Jul 1 – Sept 30</small>
          </span>
        </div>
      </>
    ),
  },
  {
    hold: 2600,
    w: 300,
    h: 220,
    className: "sb-bonus sc-titled",
    render: () => (
      <>
        <span className="c-title sb-title" data-in style={d(0)}>
          Your cash bonus is here! <span className="emoji">🤑</span>
        </span>
        <img className="sb-coins" src="/work/savings-box/coins.svg" alt="" data-move style={mv(160, "translateY(26px)")} />
      </>
    ),
  },
  {
    hold: 2600,
    w: 240,
    h: 200,
    className: "sb-boxcell",
    render: () => (
      <div className="sb-box" data-in style={d(0)}>
        <img className="sb-box-base" src="/work/savings-box/coin-box.svg" alt="" />
        <img className="sb-box-coins" src="/work/savings-box/coin-box.svg" alt="" />
      </div>
    ),
  },
  {
    hold: 2800,
    w: 240,
    h: 220,
    className: "sb-receipt",
    render: () => <img src="/work/savings-box/receipt.svg" alt="" data-in style={d(0)} />,
  },
];

export function SavingsBoxVisual({ active }: VProps) {
  return <Scenes id="box" active={active} scenes={BOX} />;
}

/* ====================================================== Group Goal Savings */

const GROUP: Scene[] = [
  {
    hold: 3000,
    w: 327,
    h: 212,
    className: "gr-foldercell",
    render: () => (
      <>
        <div className="gr-photos">
          {[2, 1, 4, 3].map((n, i) => (
            <img
              key={n}
              src={`/work/group-savings/p${n}.png`}
              alt=""
              data-move
              style={mv(320 + i * 140, "translate(-50%, 40px) rotate(0deg)", `translate(calc(-50% + var(--x${i})), 0) rotate(var(--r${i}))`)}
            />
          ))}
        </div>
        <div className="gr-folder" data-in style={d(0)}>
          <img src="/work/group-savings/folder.svg" alt="" />
          <span>Group name</span>
        </div>
      </>
    ),
  },
  {
    hold: 3200,
    w: 380,
    h: 150,
    className: "gr-team",
    render: (on) => (
      <>
        <div className="gr-who" data-in style={d(0)}>
          <img className="gr-av" src="/work/group-savings/m2.png" alt="" />
          <b>Emeralds</b>
          <span className="gr-chips">
            <span>
              <i className="gr-mini">
                <img src="/work/group-savings/m3.png" alt="" />
                <img src="/work/group-savings/m4.png" alt="" />
                <img src="/work/group-savings/m2.png" alt="" />
              </i>
              12 members
            </span>
            <span>
              <i className="gr-mini gr-mini--e">
                <img src="/work/goal-savings/e1.png" alt="" />
                <img src="/work/goal-savings/e2.png" alt="" />
                <img src="/work/goal-savings/e5.png" alt="" />
              </i>
              3 goals
            </span>
          </span>
        </div>
        <span className="gr-tghost" data-move style={mv(360, "translateX(20px) rotate(4deg)", "rotate(4deg)")} />
        <div className="gr-total" data-move style={mv(260, "translateX(20px)")}>
          <small>Total contribution</small>
          <b>
            <Count to={120000} active={on} delay={700} /> <i>XAF</i>
          </b>
          <span className="gr-save">+ Save</span>
        </div>
      </>
    ),
  },
  {
    hold: 2600,
    w: 327,
    h: 200,
    className: "gr-valid",
    render: () => (
      <>
        <span className="gr-vghost" data-move style={mv(180, "translate(-50%, 16px)", "translate(-50%, 0)")} />
        <div className="gr-vcard" data-move style={mv(60, "translate(-50%, 16px)", "translate(-50%, 0)")}>
          <span className="gr-handle" />
          <span className="gr-faces">
            <img className="f1" src="/work/group-savings/m1.png" alt="" />
            <img className="f2" src="/work/group-savings/m2.png" alt="" />
            <img className="f3" src="/work/group-savings/m4.png" alt="" />
            <span className="gr-check">
              <svg viewBox="0 0 12 12">
                <path d="M3 6.2 5 8l4-4.4" />
              </svg>
            </span>
          </span>
          <b>Assign validators</b>
          <small>To stay safe when withdrawing, choose 2 trusted members.</small>
        </div>
      </>
    ),
  },
  { hold: 2800, w: 240, h: 440, className: "sc-phonestage", render: () => <PhoneScene src="/work/group-savings/phone.png" /> },
];

export function GroupVisual({ active }: VProps) {
  return <Scenes id="group" active={active} scenes={GROUP} />;
}

/* ========================================================= Bond Investment */

const BONDS = [
  { name: "BTA Gabon", by: "Gabon government", rate: "5%", date: "Dec 29, 2024", flag: "ga" },
  { name: "OTA Tchad", by: "Tchad government", rate: "4.5%", date: "July 18, 2025", flag: "td" },
  { name: "OTA Cameroun", by: "Cameroun government", rate: "6.5%", date: "Sep 20, 2026", flag: "cm" },
];

const BOND: Scene[] = [
  {
    hold: 3400,
    w: 376,
    h: 232,
    className: "bd-bonds sc-titled",
    render: () => (
      <>
        <span className="bd-title" data-in style={d(0)}>
          Choose any country&rsquo;s bond
        </span>
        <div className="sc-stack">
        {BONDS.map((b, i) => (
          <div key={b.name} className={`bd-card k${i}`} data-move style={mv(220 + i * 260, "translateY(22px)")}>
            <div className="bd-top">
              <span className={`flag flag-${b.flag}`} />
              <span>
                <b>{b.name}</b>
                <small>Provided by the {b.by}</small>
              </span>
            </div>
            <div className="bd-nums">
              <span>
                <small>Annual interest rate</small>
                <b>{b.rate}</b>
              </span>
              <span>
                <small>Maturity date</small>
                <b>{b.date}</b>
              </span>
            </div>
          </div>
        ))}
        </div>
      </>
    ),
  },
  {
    hold: 2600,
    w: 376,
    h: 130,
    className: "bd-infocell",
    render: () => (
      <div className="bd-info" data-move style={mv(0, "translate(-16px, -50%)", "translate(0, -50%)")}>
        <span className="bd-i">i</span>
        <span>
          <b>Interest withdrawable on Sept 20, 2025.</b>
          <small>You will be able to withdraw your accrued interest starting from this date.</small>
        </span>
      </div>
    ),
  },
  { hold: 3000, w: 240, h: 440, className: "sc-phonestage", render: () => <PhoneScene src="/work/bond/phone.png" /> },
];

export function BondVisual({ active }: VProps) {
  return <Scenes id="bond" active={active} scenes={BOND} />;
}
