"use client";

import { useLayoutEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { HourglassSimple } from "@phosphor-icons/react";
import { Recording, script, useRecording } from "./recording";
import type { Base, Cam } from "./recording";
import "./homeland.css";

/*
  Homeland clinic (an exploration, mobile): checking in at a clinic and
  watching your status, played like a Screen Studio recording from
  Eucharia's frames.

  - The camera starts close on the top: "You are checked in!", and the
    status ribbon types itself out: "Status: waiting...".
  - It eases out; the white card grows and fills (estimated time, a calm
    note, the appointment, things to do while you wait; the breathing
    circles breathe).
  - The status changes as the visit moves on: the ribbon changes colour
    and retypes, yellow to blue to purple, then green: "Doctor is waiting
    for you...", and the screen turns to "Come in for your appointment!"
    with the way to the room.

  Her screens are cut into layers (public/explore/homeland); the ribbon,
  card and circles are drawn here. Points: art 700 x 913, screen 375 x 812.
*/

const W = 700;
const H = 913;
const WIDE: Cam = [W / 2, H / 2, 1];
const SY = 50.5; // the screen's top in the art
const N = "/explore/homeland/";

// The ribbon's colours for each status, from her frames.
const STATUS = [
  { word: "waiting...", fill: "#fdc94e", edge: "#e19f03", fold: "#cfcac8", ink: "#1b1d33" },
  { word: "Reviewing your details...", fill: "#4491fd", edge: "#97c1fd", fold: "#0e51ad", ink: "#fff" },
  { word: "You’re up next...", fill: "#bd02bd", edge: "#fc4efc", fold: "#620a5b", ink: "#fff" },
  { word: "Doctor is waiting for you...", fill: "#008000", edge: "#82fb82", fold: "#0c4505", ink: "#fff" },
];

type S = Base & {
  status: number;
  typed: boolean;
  body: "empty" | "full" | "message";
  built: number;
};

const START: S = {
  status: 0,
  typed: false,
  body: "empty",
  built: 0,
  cursor: [0, 0],
  click: 0,
  cam: [W / 2, 300, 1.6],
  fade: false,
  still: false,
};

// Shown while it isn't playing: checked in, everything in.
const POSTER: S = { ...START, typed: true, body: "full", built: 4, cam: WIDE };

const SCRIPT = script<S>(({ at }) => {
  const retype = (dt: number, status: number, extra: Partial<S> = {}) => {
    at(dt, (s) => ({ ...s, typed: false }));
    at(320, (s) => ({ ...s, status, ...extra }));
    at(160, (s) => ({ ...s, typed: true }));
  };
  // Checked in: the status types itself out.
  at(500, (s) => ({ ...s, typed: true }));
  // The card fills.
  at(1700, (s) => ({ ...s, cam: WIDE, body: "full" }));
  for (let k = 1; k <= 4; k++) at(k === 1 ? 420 : 220, (s) => ({ ...s, built: k }));
  // Lean in on the status and the wait.
  at(1600, (s) => ({ ...s, cam: [W / 2, SY + 415, 1.55] }));
  retype(1500, 1);
  retype(2300, 2);
  // The doctor is ready.
  retype(2300, 3, { body: "message", built: 0 });
  at(200, (s) => ({ ...s, cam: [W / 2, SY + 290, 1.55] }));
  at(3200, (s) => ({ ...s, cam: WIDE }));
  at(2400, (s) => ({ ...s, fade: true }));
});

const pos = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ left: x, top: y, width: w, height: h });

function Ribbon({ status, typed }: { status: number; typed: boolean }) {
  const st = STATUS[status];
  const group = useRef<HTMLSpanElement>(null);
  // Keep icon and words centred on the ribbon; when the words change (or the
  // font arrives), they glide to the new centre.
  useLayoutEffect(() => {
    const el = group.current;
    if (!el) return;
    const place = () => (el.style.left = `${(319 - el.offsetWidth) / 2}px`);
    place();
    const ro = new ResizeObserver(place);
    ro.observe(el);
    return () => ro.disconnect();
  }, [status]);
  return (
    <div className="hc-ribbon" style={{ "--fill": st.fill, "--edge": st.edge, "--fold": st.fold, "--ink": st.ink } as CSSProperties}>
      <i className="hc-fold hc-fold--l" />
      <i className="hc-fold hc-fold--r" />
      <span ref={group} className="hc-status">
        <HourglassSimple weight="fill" className="hc-glass" aria-hidden="true" />
        <span className={`hc-words${typed ? " is-typed" : ""}`}>
          Status: <b>{st.word}</b>
        </span>
      </span>
    </div>
  );
}

export default function HomelandFlow({ active, label }: { active: boolean; label: string }) {
  const s = useRecording(active, START, SCRIPT, POSTER);
  const full = s.body === "full";
  const msg = s.body === "message";
  const height = s.body === "empty" ? 60 : msg ? 226.5 : 552.5;

  return (
    <Recording w={W} h={H} s={s} label={label} className="hc" pointer={false}>
      <div className="hc-screen">
        <img className="hc-l is-in" src={N + "header.webp"} alt="" style={pos(22, 10, 331, 100)} />
        <div className="hc-sheet" />
        <img className={`hc-l hc-head${!msg ? " is-in" : ""}`} src={N + "checked.webp"} alt="" style={pos(40, 128, 295, 88)} />
        <img className={`hc-l hc-head${msg ? " is-in" : ""}`} src={N + "come.webp"} alt="" style={pos(40, 126, 295, 90)} />

        <div className="hc-card" style={{ height }} />
        <img className={`hc-l${full && s.built >= 1 ? " is-in" : ""}`} src={N + "est.webp"} alt="" style={pos(50, 312, 275, 50)} />
        <img className={`hc-l${full && s.built >= 2 ? " is-in" : ""}`} src={N + "note.webp"} alt="" style={pos(50, 368, 275, 52)} />
        <img className={`hc-l${full && s.built >= 3 ? " is-in" : ""}`} src={N + "appt.webp"} alt="" style={pos(50, 429, 275, 148)} />
        <img className={`hc-l${full && s.built >= 4 ? " is-in" : ""}`} src={N + "wait.webp"} alt="" style={pos(50, 584, 275, 198)} />
        <div className={`hc-breathe${full && s.built >= 4 ? " is-in" : ""}`} style={pos(213.75, 680, 106, 85.75)}>
          <i />
          <i />
          <i />
        </div>
        <img className={`hc-l hc-msg${msg ? " is-in" : ""}`} src={N + "message.webp"} alt="" style={pos(50, 320, 275, 117)} />

        <Ribbon status={s.status} typed={s.typed} />
      </div>
    </Recording>
  );
}
