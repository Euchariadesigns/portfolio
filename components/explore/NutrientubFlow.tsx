"use client";

import type { CSSProperties } from "react";
import { Recording, script, useRecording } from "./recording";
import type { Base, Cam } from "./recording";
import "./nutrientub.css";

/*
  Nutrientub (an exploration, mobile): the app opening, played like a
  Screen Studio recording, following Eucharia's keyframes.

  1. The camera glides into the corner of the Home Screen, onto the icon.
  2. A tap: the icon lifts out of the phone and grows to the middle.
  3. It opens into the app: the phone comes back with the welcome screen,
     which builds itself (title, card, the note, the food rising in).
  4. The camera leans in to read the top, then eases back and taps
     "Lets do this together".

  The welcome screen is her design cut into layers (public/explore/
  nutrientub), so each part can move; the phone and Home Screen are drawn
  here. All in points: the art is 700 x 913, the screen 375 x 812.
*/

const W = 700;
const H = 913;
const WIDE: Cam = [W / 2, H / 2, 1];
const N = "/explore/nutrientub/";

// The screen's top-left corner in the art (inside the phone's frame).
const SX = 162.5;
const SY = 50.5;
const art = (x: number, y: number) => ({ x: SX + x, y: SY + y });

// Home Screen grid: big rounded squares, two across (as in her frames).
const ICON = 112;
const COLS = [48, 215];
const ROWS = [80, 240, 400, 560];
const iconCentre = art(COLS[0] + ICON / 2, ROWS[0] + ICON / 2);

// The icon at the middle of the art, as it lifts out.
const HERO = 200;
const heroHome = `translate(${iconCentre.x - W / 2}px, ${iconCentre.y - H / 2}px) scale(${ICON / HERO})`;

type S = Base & {
  screen: "home" | "welcome";
  phone: boolean;
  hero: "off" | "home" | "centre" | "gone";
  pressed: "" | "icon" | "button";
  /** How much of the welcome screen has come in (0 = nothing). */
  built: number;
  tap: { x: number; y: number; k: number } | null;
};

const BASE: S = {
  screen: "home",
  phone: true,
  hero: "off",
  pressed: "",
  built: 0,
  tap: null,
  cursor: [0, 0],
  click: 0,
  cam: [225, 187, 2.4],
  fade: false,
  still: false,
};

const START: S = { ...BASE, cam: [142, 153, 2.9] };

// Shown while it isn't playing: the finished welcome screen.
const POSTER: S = { ...BASE, screen: "welcome", built: 9, cam: WIDE };

const BUTTON = art(187.5, 744);

const SCRIPT = script<S>(({ at }) => {
  const tap = (dt: number, p: { x: number; y: number }, pressed: S["pressed"]) => {
    at(dt, (s) => ({ ...s, tap: { ...p, k: (s.tap?.k ?? 0) + 1 }, pressed }));
    at(220, (s) => ({ ...s, pressed: "" }));
  };
  // 1. Into the corner of the Home Screen.
  at(100, (s) => ({ ...s, cam: [225, 187, 2.4] }));
  // 2. Tap the icon; it lifts out and grows to the middle.
  tap(1500, iconCentre, "icon");
  at(260, (s) => ({ ...s, hero: "home" }));
  at(60, (s) => ({ ...s, hero: "centre", phone: false, cam: [W / 2, H / 2, 1.25] }));
  // 3. It opens into the app.
  at(1500, (s) => ({ ...s, screen: "welcome", hero: "gone", phone: true, cam: WIDE }));
  for (let k = 1; k <= 9; k++) at(k === 1 ? 380 : 170, (s) => ({ ...s, built: k }));
  // 4. Lean in to read the top, back out, tap the button.
  at(1300, (s) => ({ ...s, cam: [W / 2, 331, 1.5] }));
  at(2700, (s) => ({ ...s, cam: WIDE }));
  tap(1500, BUTTON, "button");
  at(1500, (s) => ({ ...s, fade: true }));
});

const pos = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ left: x, top: y, width: w, height: h });

/** A layer of her welcome screen, coming in at step `k`. */
function Layer({ k, built, src, x, y, w, h, className = "" }: { k: number; built: number; src: string; x: number; y: number; w: number; h: number; className?: string }) {
  return <img className={`nt-layer ${className}${built >= k ? " is-in" : ""}`} src={N + src} alt="" style={pos(x, y, w, h)} />;
}

export default function NutrientubFlow({ active, label }: { active: boolean; label: string }) {
  const s = useRecording(active, START, SCRIPT, POSTER);
  const b = s.built;

  return (
    <Recording w={W} h={H} s={s} label={label} className="nt" pointer={false}>
      {/* The phone */}
      <div className={`nt-device${s.phone ? "" : " is-away"}`}>
        <i className="nt-btn" style={{ left: -3, top: 166, height: 36 }} />
        <i className="nt-btn" style={{ left: -3, top: 229, height: 66 }} />
        <i className="nt-btn" style={{ left: -3, top: 311, height: 66 }} />
        <i className="nt-btn" style={{ right: -3, top: 274, height: 102 }} />
        <div className="nt-bezel">
          <div className="nt-screen">
            {/* Home Screen */}
            <div className="nt-home" data-on={s.screen === "home"}>
              <i className="nt-island" />
              {ROWS.flatMap((y, r) =>
                COLS.map((x, c) =>
                  r === 0 && c === 0 ? (
                    <img
                      key="app"
                      className={`nt-app${s.pressed === "icon" ? " is-pressed" : ""}${s.hero !== "off" ? " is-lifted" : ""}`}
                      src={N + "icon.webp"}
                      alt=""
                      style={pos(x, y, ICON, ICON)}
                    />
                  ) : (
                    <i key={`${r}-${c}`} className="nt-slot" style={pos(x, y, ICON, ICON)} />
                  ),
                ),
              )}
            </div>

            {/* Welcome: her design, in layers */}
            <div className="nt-welcome" data-on={s.screen === "welcome"}>
              <img className="nt-layer is-in" src={N + "status.webp"} alt="" style={pos(22, 10, 331, 40)} />
              <Layer k={1} built={b} src="title.webp" x={14} y={86} w={348} h={36} />
              <Layer k={2} built={b} src="sub.webp" x={14} y={128} w={348} h={42} />
              <div className={`nt-card${b >= 3 ? " is-in" : ""}`} style={pos(19, 203.5, 336.5, 464.5)}>
                <Layer k={4} built={b} src="head.webp" x={11} y={13.5} w={315} h={117} />
                <Layer k={5} built={b} src="note.webp" x={97.75} y={140} w={142} h={111.75} className="nt-note" />
                <Layer k={6} built={b} src="food.webp" x={0} y={258.5} w={336.5} h={206} className="nt-food" />
              </div>
              <Layer
                k={7}
                built={b}
                src="button.webp"
                x={14}
                y={717}
                w={348}
                h={54}
                className={`nt-button${s.pressed === "button" ? " is-pressed" : ""}`}
              />
              <img className="nt-layer is-in" src={N + "ghost.webp"} alt="" style={pos(150, 781, 75, 28)} />
            </div>
          </div>
        </div>
      </div>

      {/* The icon, lifting out of the phone */}
      <img className="nt-hero" data-state={s.hero} src={N + "icon.webp"} alt="" style={{ "--home": heroHome } as CSSProperties} />

      {s.tap && <span key={s.tap.k} className="gf-tap" style={{ left: s.tap.x, top: s.tap.y }} />}
    </Recording>
  );
}
