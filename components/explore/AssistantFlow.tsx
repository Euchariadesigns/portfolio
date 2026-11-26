"use client";

import type { CSSProperties } from "react";
import { Recording, script, useRecording } from "./recording";
import type { Base, Cam } from "./recording";
import "./assistant.css";

/*
  AI Assistant (an exploration): the assistant's welcome in a police case
  management dashboard, played like a Screen Studio recording from
  Eucharia's three frames.

  The cursor picks each feature on the left and the panel on the right
  shows it working: crime patterns on the Lagos map (the alerts pulse),
  a report writing itself until "Report generated", then an AI search
  being typed, finding the case, and the case folders rising in. Then it
  clicks Get started. The camera leans in on each panel.

  The frame is the backdrop; each panel is cut into bands that arrive one
  by one. Points: 1490 x 1024 (her frames at 2x).
*/

const W = 1490;
const H = 1024;
const N = "/explore/assistant/";
const MODAL: Cam = [745, 512, 1.3];
const PANEL: Cam = [983, 512, 1.9];
const QUERY = "Case RPF2035-1ws";

// The three features in the list (their rows, in points) and where the cursor clicks.
const ITEMS = [
  { y: 424, h: 64, click: [372, 437] },
  { y: 501, h: 64, click: [362, 514] },
  { y: 578, h: 64, click: [362, 591] },
] as const;

type S = Base & {
  active: number;
  step: number;
  typed: number;
};

const START: S = { active: 0, step: 1, typed: 0, cursor: [620, 830], click: 0, cam: MODAL, fade: false, still: false };
const POSTER: S = { ...START, active: 1, step: 5 };

const SCRIPT = script<S>(({ at, move, click }) => {
  // 1. Crime pattern analysis: the map.
  at(1300, (s) => ({ ...s, cam: PANEL }));
  at(2600, (s) => ({ ...s, cam: MODAL }));
  // 2. Report generation: the report writes itself.
  move(700, ITEMS[1].click);
  click(800, (s) => ({ ...s, active: 1, step: 0 }));
  for (let k = 1; k <= 4; k++) at(k === 1 ? 300 : 380, (s) => ({ ...s, step: k }));
  at(200, (s) => ({ ...s, cam: PANEL }));
  at(700, (s) => ({ ...s, step: 5 }));
  at(2000, (s) => ({ ...s, cam: MODAL }));
  // 3. Smart case search: typed, found, the folders rise.
  move(700, ITEMS[2].click);
  click(800, (s) => ({ ...s, active: 2, step: 0, typed: 0 }));
  at(250, (s) => ({ ...s, step: 1, cam: PANEL }));
  for (let k = 1; k <= QUERY.length; k++) at(k === 1 ? 700 : 55, (s) => ({ ...s, typed: k }));
  at(350, (s) => ({ ...s, step: 2 }));
  at(800, (s) => ({ ...s, step: 3 }));
  at(2000, (s) => ({ ...s, cam: MODAL }));
  // 4. Get started.
  move(900, [497, 714]);
  click(800, (s) => s);
  at(900, (s) => ({ ...s, fade: true }));
});

const box = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: x, top: y, width: w, height: h });

/** A band of a panel, in panel points, shown once `on`. */
function Band({ src, y, h, on, className = "" }: { src: string; y: number; h: number; on: boolean; className?: string }) {
  return <img className={`as-band ${className}${on ? " is-in" : ""}`} src={N + src + ".webp"} alt="" style={box(0, y, 482.5, h)} />;
}

const PINS: [number, number, string][] = [
  [28.3, 90, "o"],
  [318, 124.3, "r"],
  [129.7, 235.3, "o"],
  [139.3, 349.3, "o"],
  [439.6, 343.4, "o"],
];

export default function AssistantFlow({ active, label }: { active: boolean; label: string }) {
  const s = useRecording(active, START, SCRIPT, POSTER);
  const a = s.active;

  return (
    <Recording w={W} h={H} s={s} label={label} className="as">
      <img className="as-base" src={N + "base.webp"} alt="" />

      {/* The list: the feature being shown stays bright, the others dim. */}
      {ITEMS.map((it, i) => (
        <i key={i} className={`as-dim${a === i ? "" : " is-on"}`} style={box(290, it.y, 415, it.h)} />
      ))}
      <i className="as-bar" style={{ top: ITEMS[a].y + 6, height: ITEMS[a].h - 12 }} />

      {/* The panel */}
      <div className="as-panel" style={box(742, 272, 482.5, 479.5)}>
        {/* Crime pattern analysis */}
        <div className="as-scene as-map" data-on={a === 0}>
          <div className="as-zoom">
            <img src={N + "map.webp"} alt="" style={box(0, 0, 482.5, 479.5)} />
            {PINS.map(([x, y, c], i) => (
              <i key={i} className={`as-pulse as-pulse--${c}`} style={{ left: x, top: y, animationDelay: `${i * -0.4}s` }} />
            ))}
          </div>
        </div>

        {/* Report generation */}
        <div className="as-scene" data-on={a === 1}>
          <Band src="report1" y={0} h={126.5} on={a === 1 && s.step >= 1} />
          <Band src="report2" y={126.5} h={136.5} on={a === 1 && s.step >= 2} />
          <Band src="report3" y={263} h={74.5} on={a === 1 && s.step >= 3} />
          <Band src="report4" y={337.5} h={85} on={a === 1 && s.step >= 4} />
          <Band src="report5" y={422.5} h={57} on={a === 1 && s.step >= 5} className="as-toast" />
        </div>

        {/* Smart case search */}
        <div className="as-scene" data-on={a === 2}>
          <Band src="search1" y={0} h={80} on={a === 2 && s.step >= 1} />
          <Band src="search2" y={80} h={58} on={a === 2 && s.step >= 1} />
          <span className={`as-type${a === 2 && s.step >= 1 ? " is-in" : ""}`} style={box(93, 100, 300, 24)}>
            <span>{QUERY.slice(0, s.typed)}</span>
            {s.step < 2 ? <i className="as-caret" /> : null}
          </span>
          <Band src="search3" y={138} h={60} on={a === 2 && s.step >= 2} />
          <span className={`as-spin${a === 2 && s.step >= 2 ? " is-in" : ""}`} style={{ left: 95.4, top: 169 }}>
            <i />
          </span>
          <Band src="search4" y={198} h={281.5} on={a === 2 && s.step >= 3} className="as-rise" />
        </div>
      </div>
    </Recording>
  );
}
