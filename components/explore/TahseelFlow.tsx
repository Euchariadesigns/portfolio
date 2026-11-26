"use client";

import type { CSSProperties } from "react";
import { IconSignal, IconWifi } from "@/components/visuals/GoalFlow";
import { Recording, script, useRecording } from "./recording";
import type { Base, Cam } from "./recording";
import "./tahseel.css";

/*
  Tahseel (an exploration, mobile): paying an invoice, played like a Screen
  Studio recording from Eucharia's screens.

  The invoice builds in (verified sender, amount, details, items), the
  page scrolls to the payment methods, Bank is tapped and "Proceed to
  payment" turns on. The "Pay via bank" sheet rises; the bank field opens
  a short list and Al Rajhi Bank is picked; Proceed again, and "Payment
  Confirmed" rises with the receipt.

  Her screens are cut into bands (public/explore/tahseel); the radio, the
  bank list and the sheets' movement are drawn here.
  Points: art 700 x 913, screen 360 x 780 (her screens are 360 wide).
*/

const W = 700;
const H = 913;
const WIDE: Cam = [W / 2, H / 2, 1];
const SX = 170;
const SY = 66.5;
const SB = 44; // status bar
const N = "/explore/tahseel/";
const SCROLL = 150;

// Screen points -> art points, for the taps.
const art = (x: number, y: number) => ({ x: SX + x, y: SY + y });

type S = Base & {
  built: number;
  scroll: number;
  bank: boolean;
  sheet: "none" | "bank" | "done";
  list: boolean;
  rajhi: boolean;
  done: number;
  pressed: "" | "bar" | "sheet";
  tap: { x: number; y: number; k: number } | null;
};

const START: S = {
  built: 0,
  scroll: 0,
  bank: false,
  sheet: "none",
  list: false,
  rajhi: false,
  done: 0,
  pressed: "",
  tap: null,
  cursor: [0, 0],
  click: 0,
  cam: [W / 2, SY + 260, 1.5],
  fade: false,
  still: false,
};

const POSTER: S = { ...START, built: 6, cam: WIDE };

const SCRIPT = script<S>(({ at }) => {
  const tap = (dt: number, p: { x: number; y: number }, then: (s: S) => S) => {
    at(dt, (s) => ({ ...s, tap: { ...p, k: (s.tap?.k ?? 0) + 1 } }));
    at(240, then);
  };
  // The invoice builds in.
  for (let k = 1; k <= 6; k++) at(k === 1 ? 350 : 170, (s) => ({ ...s, built: k }));
  // Down to the payment methods.
  at(1500, (s) => ({ ...s, cam: WIDE, scroll: SCROLL }));
  at(1400, (s) => ({ ...s, cam: [W / 2, 608, 1.45] }));
  // Bank.
  tap(1200, art(90, SB + 710 - SCROLL), (s) => ({ ...s, bank: true }));
  // Proceed to payment.
  tap(1200, art(180, 694), (s) => ({ ...s, pressed: "bar" }));
  at(200, (s) => ({ ...s, pressed: "", sheet: "bank" }));
  // The bank list: Al Rajhi.
  tap(1500, art(180, 580), (s) => ({ ...s, list: true }));
  tap(1100, art(150, 653), (s) => ({ ...s, list: false, rajhi: true }));
  // Proceed: paid.
  tap(1300, art(180, 685.5), (s) => ({ ...s, pressed: "sheet" }));
  at(260, (s) => ({ ...s, pressed: "", sheet: "done", cam: WIDE }));
  for (let k = 1; k <= 5; k++) at(k === 1 ? 450 : 160, (s) => ({ ...s, done: k }));
  at(500, (s) => ({ ...s, cam: [W / 2, SY + 470, 1.45] }));
  at(2600, (s) => ({ ...s, cam: WIDE }));
  at(1800, (s) => ({ ...s, fade: true }));
});

const pos = (y: number, h: number, x = 0, w = 360): CSSProperties => ({ left: x, top: y, width: w, height: h });

const PAGE: [string, number, number][] = [
  ["head", 0, 62],
  ["verified", 62, 138],
  ["amount", 200, 122],
  ["details", 322, 110],
  ["items", 432, 140],
  ["methods", 572, 182],
];

const CONFIRM: [string, number, number][] = [
  ["c-icon", 20, 96],
  ["c-title", 120, 30],
  ["c-amount", 154, 34],
  ["c-card", 205, 165],
  ["c-button", 389, 66],
];

const BANKS = [
  { name: "Al Rajhi Bank", logo: "logo-rajhi" },
  { name: "Saudi National Bank", logo: "logo-bank" },
  { name: "Riyad Bank", logo: "logo-bank" },
];

export default function TahseelFlow({ active, label }: { active: boolean; label: string }) {
  const s = useRecording(active, START, SCRIPT, POSTER);

  return (
    <Recording w={W} h={H} s={s} label={label} className="th" pointer={false}>
      <div className="th-screen">
        <div className="gf-status th-status">
          <span>9:41</span>
          <span className="gf-status-r">
            <IconSignal />
            <IconWifi />
            <span className="gf-batt" />
          </span>
        </div>

        {/* The invoice, scrolling under the bottom bar */}
        <div className="th-page">
          <div className="th-scroll" style={{ transform: `translateY(${-s.scroll}px)` }}>
            {PAGE.map(([src, y, h], i) => (
              <img key={src} className={`th-l${s.built > i ? " is-in" : ""}`} src={`${N}${src}.webp`} alt="" style={pos(y, h)} />
            ))}
            {/* The Bank option's radio */}
            <span className={`th-radio${s.bank ? " is-on" : ""}`} style={{ left: 35.5, top: 710 }}>
              <i />
            </span>
          </div>
        </div>

        <div className={`th-bar${s.built >= 1 ? " is-in" : ""}${s.pressed === "bar" ? " is-pressed" : ""}`}>
          <img src={N + "bar-on.webp"} alt="" style={pos(0, 136)} />
          <img className={`th-off${s.bank ? " is-gone" : ""}`} src={N + "bar-off.webp"} alt="" style={pos(0, 136)} />
        </div>

        {/* Sheets */}
        <div className="th-dim" data-on={s.sheet !== "none"} />
        <div className={`th-sheet${s.pressed === "sheet" ? " is-pressed" : ""}`} data-on={s.sheet === "bank"} style={{ height: 305.5 }}>
          <img src={N + "sheet-rajhi.webp"} alt="" style={pos(0, 305.5)} />
          <img className={`th-off${s.rajhi ? " is-gone" : ""}`} src={N + "sheet-select.webp"} alt="" style={pos(0, 305.5)} />
          <div className="th-list" data-on={s.list}>
            {BANKS.map((b) => (
              <span key={b.name}>
                <img src={`${N}${b.logo}.webp`} alt="" />
                {b.name}
              </span>
            ))}
          </div>
        </div>
        <div className="th-sheet th-done" data-on={s.sheet === "done"} style={{ height: 488 }}>
          {CONFIRM.map(([src, y, h], i) => (
            <img key={src} className={`th-l${s.done > i ? " is-in" : ""}${i === 0 ? " th-pop" : ""}`} src={`${N}${src}.webp`} alt="" style={pos(y, h)} />
          ))}
        </div>
      </div>

      {s.tap && <span key={s.tap.k} className="gf-tap" style={{ left: s.tap.x, top: s.tap.y }} />}
    </Recording>
  );
}
