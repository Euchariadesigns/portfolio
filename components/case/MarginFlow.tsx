"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowLeftRightIcon,
  ArrowRight01Icon,
  BookCheckIcon,
  BookEditIcon,
  Camera01Icon,
  MoreVerticalIcon,
  Notification01Icon,
  Settings02Icon,
  Share03Icon,
} from "@hugeicons/core-free-icons";
import { IconSignal, IconWifi } from "@/components/visuals/GoalFlow";
import "./margin-flow.css";

/*
  Margin, playing by itself in a phone, like a screen recording: a soft dot
  shows each tap, and the screens move the way the real app does. Built from
  Eucharia's Figma screens (375 wide; the paper, the type and the Hugeicons
  are hers) and the app's own behaviour: the question glides when the timer
  starts, the camera settles on the page, Gap closed offers a reminder.

  Four flows, one per place in the case study:
  - loop: one whole day, from the question to Gap closed and This week.
  - principles: the welcome note being read, then Settings.
  - camera: allowing the camera, a blurry photo, a retake, saving.
  - gap: saving the page, Gap closed, setting tomorrow's reminder.
  - before / after: "Gap closed." as it first was (See today's note) and as
    it is now (tomorrow's question, and Set a reminder first).
  - home: adding Margin to the Home Screen from Safari (her own iPhone
    screenshots, with the people in the share sheet taken out), then
    opening it like any other app.

  It plays while it is on screen and starts again each time it comes back.
*/

export type FlowId = "loop" | "principles" | "camera" | "gap" | "home" | "before" | "after";

const F = "/case/margin/flow/";

const QUESTION = "What is something you believed for years and later changed your mind about? What led to the change?";

// Her welcome note, from the Figma intro page.
const WELCOME =
  "For a long time, I noticed that most people including myself, were slowly losing the habit of thinking things through, of putting thoughts into words, of having ideas of our own. I kept asking: what’s really going on? And how can we get better? Margin is our answer: the deliberate art of thinking through a question, then writing your thoughts down. Each day you get one question. You take a few quiet minutes to think, then write by hand in your own notebook. When you’re done, you take a photo of your page. It stays on your phone, a record of your thinking that only you can see. The questions start easy and get deeper, little by little. The change is subtle, but we hope you’ll see it when you look back from Day 30 to Day 1, and that you’ll spread the gospel of Margin. There are no right answers. Margin will never grade you. All you need is a notebook and a pen.";
const WORDS = WELCOME.split(/(?<=\s)/);

// The reminder wheel (Gap closed): hours and minutes either side of 7:45.
const HOURS = [3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINS = [41, 42, 43, 44, 45, 46, 47, 48, 49];

type Tap = { x: number; y: number; k: number; dy?: number };

type S = {
  base: "welcome" | "practice" | "week" | "safari" | "home";
  /** Safari: which of her screenshots is showing (page, menu, share, add). */
  ios: number;
  /** The Margin icon is on the Home Screen; tapping it opens the app. */
  icon: boolean;
  launch: boolean;
  /** Practice: waiting, thinking (timer on), time's up (write, then photo), or Gap closed. */
  stage: "idle" | "think" | "up" | "done";
  /** Gap closed: the first version, the new one with no reminder yet, or with one set. */
  done: "before" | "after" | "set";
  /** Today's page, set down on Gap closed. */
  peek: boolean;
  secs: number;
  sheet: null | "photo" | "settings";
  photo: "allow" | "camera" | "check" | "gap";
  /** The page sits inside the corners. */
  locked: boolean;
  blur: boolean;
  shot: number;
  alert: null | "camera" | "notify";
  hour: number;
  min: number;
  read: number;
  sign: boolean;
  remind: boolean;
  card: boolean;
  tab: 0 | 1;
  tap: Tap | null;
  fade: boolean;
  still: boolean;
};

const BASE: S = {
  base: "practice",
  stage: "idle",
  secs: 60,
  sheet: null,
  photo: "camera",
  locked: false,
  blur: false,
  shot: 0,
  alert: null,
  hour: HOURS.indexOf(7),
  min: MINS.indexOf(45),
  read: 0,
  sign: false,
  remind: false,
  card: false,
  done: "set",
  peek: false,
  ios: 0,
  icon: false,
  launch: false,
  tab: 0,
  tap: null,
  fade: false,
  still: false,
};

const START: Record<FlowId, S> = {
  loop: BASE,
  principles: { ...BASE, base: "welcome" },
  camera: { ...BASE, stage: "up" },
  // Gap closed: the wheel starts at 9:47 and is turned to 7:45.
  gap: { ...BASE, stage: "up", sheet: "photo", photo: "check", hour: HOURS.indexOf(9), min: MINS.indexOf(47) },
  home: { ...BASE, base: "safari" },
  before: { ...BASE, stage: "done", done: "before" },
  after: { ...BASE, stage: "done", done: "after", photo: "gap" },
};

const GAP_TEXT = {
  before: "See you tomorrow. Turn on a reminder in Settings so you don’t miss your next question.",
  after: "Tomorrow’s question is about a song you never get tired of. Habits stick when they happen every day, so set a reminder and we’ll nudge you when it’s time.",
  set: "Tomorrow’s question is about a song you never get tired of. We’ll remind you at 7:45 PM.",
};

// Her screenshots, in order, and where each tap lands on them.
const IOS = ["ios-safari", "ios-menu", "ios-share", "ios-add"];
const IOS_TAP = [
  [330, 800], // ••• in Safari's bar
  [175, 549], // Share
  [130, 640], // Add to Home Screen
  [336, 101], // Add
] as const;
const ICON = [55, 104] as const;

// Where things are, in iPhone points (the Figma frame).
const AT = {
  timer: [188, 522],
  pill: [187.5, 690],
  under: [187.5, 745],
  shutter: [187.5, 698],
  gear: [337, 69],
  getStarted: [187.5, 799],
  toggle: [317.5, 167],
  alertAllow: [255, 498],
  note: [187.5, 595],
  hours: [128.5, 316],
  mins: [177, 380],
} as const;

type Step = [number, (s: S) => S];

function build(fn: (at: (dt: number, f: (s: S) => S) => void, tap: (dt: number, p: readonly number[], dy?: number) => void) => void) {
  const steps: Step[] = [];
  let t = 0;
  const at = (dt: number, f: (s: S) => S) => {
    t += dt;
    steps.push([t, f]);
  };
  const tap = (dt: number, [x, y]: readonly number[], dy?: number) => at(dt, (s) => ({ ...s, tap: { x, y, dy, k: (s.tap?.k ?? 0) + 1 } }));
  fn(at, tap);
  return { steps, total: t + 520 };
}

// The minute, sped up: 60 seconds in about two and a half.
function countdown(at: (dt: number, f: (s: S) => S) => void) {
  for (let s = 59; s >= 0; s--) at(s === 59 ? 700 : 40, (f) => ({ ...f, secs: s }));
}

function shoot(at: (dt: number, f: (s: S) => S) => void, tap: (dt: number, p: readonly number[]) => void, blur: boolean) {
  at(1000, (s) => ({ ...s, locked: true }));
  tap(700, AT.shutter);
  at(220, (s) => ({ ...s, shot: s.shot + 1 }));
  at(240, (s) => ({ ...s, photo: "check", blur }));
}

// Back on Practice: Gap closed, today's page set down, then the note.
function closed(at: (dt: number, f: (s: S) => S) => void, tap: (dt: number, p: readonly number[]) => void) {
  at(300, (s) => ({ ...s, stage: "done", done: "set", peek: false }));
  at(420, (s) => ({ ...s, sheet: null }));
  at(520, (s) => ({ ...s, peek: true }));
  tap(2100, AT.note);
  at(260, (s) => ({ ...s, base: "week", tab: 1 }));
  at(520, (s) => ({ ...s, card: true }));
  at(2600, (s) => ({ ...s, fade: true }));
}

// The wheel turns to 7:45 PM: a slow drag on the hours, then the minutes.
function setTime(at: (dt: number, f: (s: S) => S) => void, tap: (dt: number, p: readonly number[], dy?: number) => void) {
  tap(1200, AT.hours, 64);
  at(260, (s) => ({ ...s, hour: s.hour - 1 }));
  at(160, (s) => ({ ...s, hour: s.hour - 1 }));
  tap(700, AT.mins, 64);
  at(260, (s) => ({ ...s, min: s.min - 1 }));
  at(160, (s) => ({ ...s, min: s.min - 1 }));
}

const SCRIPTS = {
  loop: build((at, tap) => {
    tap(1700, AT.timer);
    at(260, (s) => ({ ...s, stage: "think" }));
    countdown(at);
    at(500, (s) => ({ ...s, stage: "up" }));
    tap(2200, AT.pill);
    at(260, (s) => ({ ...s, sheet: "photo", photo: "camera" }));
    shoot(at, tap, false);
    tap(1500, AT.pill);
    at(260, (s) => ({ ...s, photo: "gap" }));
    tap(1900, AT.pill);
    closed(at, tap);
  }),
  principles: build((at, tap) => {
    for (let i = 0; i < WORDS.length; i += 6) at(i === 0 ? 900 : 110, (s) => ({ ...s, read: i + 6 }));
    at(300, (s) => ({ ...s, sign: true }));
    tap(1300, AT.getStarted);
    at(260, (s) => ({ ...s, base: "practice" }));
    tap(1600, AT.gear);
    at(260, (s) => ({ ...s, sheet: "settings" }));
    tap(1300, AT.toggle);
    at(240, (s) => ({ ...s, remind: true }));
    at(3000, (s) => ({ ...s, fade: true }));
  }),
  camera: build((at, tap) => {
    tap(1500, AT.pill);
    at(260, (s) => ({ ...s, sheet: "photo", photo: "allow" }));
    tap(1700, AT.pill);
    at(260, (s) => ({ ...s, alert: "camera" }));
    tap(1300, AT.alertAllow);
    at(260, (s) => ({ ...s, alert: null, photo: "camera" }));
    shoot(at, tap, true);
    tap(1800, AT.under);
    at(260, (s) => ({ ...s, photo: "camera", locked: false, blur: false }));
    shoot(at, tap, false);
    tap(1600, AT.pill);
    at(260, (s) => ({ ...s, photo: "gap" }));
    at(2200, (s) => ({ ...s, fade: true }));
  }),
  gap: build((at, tap) => {
    tap(1300, AT.pill);
    at(260, (s) => ({ ...s, photo: "gap" }));
    setTime(at, tap);
    tap(1300, AT.pill);
    at(260, (s) => ({ ...s, alert: "notify" }));
    tap(1300, AT.alertAllow);
    at(260, (s) => ({ ...s, alert: null }));
    closed(at, tap);
  }),
  before: build((at, tap) => {
    at(700, (s) => ({ ...s, peek: true }));
    tap(2600, AT.note);
    at(260, (s) => ({ ...s, base: "week", tab: 1 }));
    at(520, (s) => ({ ...s, card: true }));
    at(2600, (s) => ({ ...s, fade: true }));
  }),
  after: build((at, tap) => {
    at(700, (s) => ({ ...s, peek: true }));
    tap(3000, AT.note);
    at(260, (s) => ({ ...s, sheet: "photo", photo: "gap" }));
    tap(1700, AT.pill);
    at(260, (s) => ({ ...s, alert: "notify" }));
    tap(1300, AT.alertAllow);
    at(260, (s) => ({ ...s, alert: null }));
    at(300, (s) => ({ ...s, sheet: null, done: "set" }));
    at(3400, (s) => ({ ...s, fade: true }));
  }),
  home: build((at, tap) => {
    IOS_TAP.forEach((p, i) => {
      tap(i === 0 ? 1500 : i === 2 ? 1500 : 1300, p);
      at(240, (s) => (i < IOS.length - 1 ? { ...s, ios: i + 1 } : { ...s, base: "home" }));
    });
    at(650, (s) => ({ ...s, icon: true }));
    tap(1500, ICON);
    at(240, (s) => ({ ...s, base: "practice", launch: true }));
    at(3000, (s) => ({ ...s, fade: true }));
  }),
};

const Icon = ({ icon, size = 20, color = "#242424", w = 1.5 }: { icon: IconSvgElement; size?: number; color?: string; w?: number }) => (
  <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={w} />
);

const pos = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ left: x, top: y, width: w, height: h });

export default function MarginFlow({ flow, label }: { flow: FlowId; label: string }) {
  const start = START[flow];
  const [s, set] = useState<S>(start);
  const [active, setActive] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  // Plays only while it is on screen.
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.45 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const timers: number[] = [];
    const later = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));
    const clear = () => timers.splice(0).forEach((id) => window.clearTimeout(id));
    if (!active || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      set({ ...start, still: true });
      return clear;
    }
    const script = SCRIPTS[flow];
    const run = (delay: number) => {
      for (const [t, fn] of script.steps) later(delay + t, () => set(fn));
      later(delay + script.total, () => {
        set({ ...start, fade: true, still: true });
        later(60, () => set(start));
        run(600);
      });
    };
    set(start);
    run(500);
    return clear;
  }, [active, flow, start]);

  const practice = s.base === "practice";
  const lastAlert = useRef<"camera" | "notify">("camera");
  if (s.alert) lastAlert.current = s.alert;
  const alertKind = lastAlert.current;
  const mm = Math.floor(s.secs / 60);
  const ss = String(s.secs % 60).padStart(2, "0");

  return (
    <div className="mf" ref={boxRef} role="img" aria-label={label}>
      <div className="gf-phone mf-phone">
        <div className={`mf-screen${s.fade ? " is-fading" : ""}${s.still ? " is-still" : ""}`}>
          <div className="mf-world">
            {/* ---------------------------------------------------- Safari (her screenshots) */}
            <section className="mf-scr mf-ios" data-on={s.base === "safari"}>
              {IOS.map((src, i) => (
                <img key={src} src={`${F}${src}.webp`} alt="" data-i={i} className={i <= s.ios ? "is-on" : undefined} />
              ))}
            </section>

            {/* ---------------------------------------------------- Home Screen */}
            <section className="mf-scr mf-home" data-on={s.base === "home"}>
              <span className={`mf-app${s.icon ? " is-on" : ""}`} style={pos(ICON[0] - 30, ICON[1] - 30)}>
                <img src={`${F}notebook-tile.png`} alt="" />
                <span>Margin</span>
              </span>
            </section>

            {/* ---------------------------------------------------- Welcome */}
            <section className="mf-scr mf-paper" data-on={s.base === "welcome"}>
              <img className="mf-abs" src={`${F}notebook-tile.png`} alt="" style={pos(163, 72, 49, 49)} />
              <h4 className="mf-abs mf-welcome-t" style={pos(0, 132, 375)}>
                Welcome to Margin!
              </h4>
              <div className="mf-abs mf-card mf-welcome-card" style={pos(21, 184, 333)}>
                <p className="mf-note">
                  {WORDS.map((w, i) => (
                    <span key={i} className={i < s.read ? "is-read" : undefined}>
                      {w}
                    </span>
                  ))}
                </p>
                <p className={`mf-sign${s.sign ? " is-on" : ""}`}>
                  <img src={`${F}signature-squiggle.svg`} alt="" />
                  Eucharia, founder of Margin
                  <img src={`${F}signature-squiggle.svg`} alt="" />
                </p>
              </div>
              <span className="mf-abs mf-btn" style={pos(91, 772, 193, 54)}>
                Get started
              </span>
            </section>

            {/* ---------------------------------------------------- Practice */}
            <section className={`mf-scr mf-paper mf-practice${s.launch ? " mf-launch" : ""}`} data-on={practice} data-stage={s.stage} style={{ transformOrigin: `${ICON[0]}px ${ICON[1]}px` }}>
              <span className="mf-abs mf-eyebrow mf-top" style={pos(0, 59, 375)}>
                Close today’s gap
              </span>
              <span className="mf-abs mf-round mf-top" style={pos(319, 51, 36, 36)}>
                <Icon icon={Settings02Icon} />
              </span>
              <img className="mf-abs mf-close mf-session" src={`${F}close.svg`} alt="" style={pos(16, 63, 20, 20)} />

              {/* Time's up: write, then a photo. */}
              <h4 className="mf-abs mf-head mf-up" style={pos(0, 128, 375)}>
                Now, write.
              </h4>
              <div className="mf-abs mf-card mf-card--text mf-up" style={pos(16, 196, 343)}>
                Write your answer in your notebook, then take a photo of the page. The photo stays on your phone, and only you can see it.
              </div>
              <span className="mf-abs mf-today mf-up" style={pos(0, 322, 375)}>
                <i />
                Today’s question
              </span>

              <p className="mf-abs mf-question" style={pos(24, 187, 327)}>
                {QUESTION}
              </p>

              <div className="mf-abs mf-card mf-card--text mf-idle" style={pos(16, 344, 343, 96)}>
                Take 1 minute to think. Then write your answer by hand in your notebook and take a photo. That’s it for today.
              </div>
              <span className="mf-abs mf-btn mf-btn--icon mf-idle" style={pos(141, 495, 94, 54)}>
                <img src={`${F}clock.svg`} alt="" />
              </span>

              {/* Thinking: the minute counting down. */}
              <div className="mf-abs mf-clock mf-think" style={pos(0, 410, 375)}>
                <span className="mf-digits">
                  {`${mm}:${ss}`.split("").map((c, i) => (
                    <i key={i} className={c === ":" ? "is-colon" : undefined}>
                      {c}
                    </i>
                  ))}
                </span>
                <span className="mf-of">of 1 minute</span>
              </div>
              <span className="mf-abs mf-body mf-think" style={pos(0, 735, 375)}>
                No need to write yet. Just think.
              </span>

              <span className="mf-abs mf-btn mf-up" style={pos(91, 663, 193, 54)}>
                <Icon icon={Camera01Icon} color="#fff" size={20} w={1.8} />
                Take photo
              </span>

              {/* Gap closed: today's page set down, slightly tilted. */}
              <span className={`mf-abs mf-peek mf-done${s.peek ? " is-on" : ""}`} style={pos(131.5, 226, 112, 150)}>
                <img src={`${F}page.webp`} alt="" />
              </span>
              <h4 className="mf-abs mf-head mf-done" style={pos(0, 400, 375)}>
                Gap closed.
              </h4>
              <p className="mf-abs mf-body mf-done mf-gap-text" style={pos(16, 456, 343)}>
                {GAP_TEXT[s.done]}
              </p>
              <span className={`mf-abs mf-btn mf-done mf-swap${s.done === "after" ? " is-on" : ""}`} style={pos(72.5, 568, 230, 54)}>
                <Icon icon={Notification01Icon} color="#fff" size={20} w={1.8} />
                Set a reminder
              </span>
              <span className={`mf-abs mf-btn mf-btn--light mf-done mf-swap${s.done !== "after" ? " is-on" : ""}`} style={pos(77.5, 568, 220, 54)}>
                See today’s note
              </span>
            </section>

            {/* ---------------------------------------------------- This week */}
            <section className="mf-scr mf-paper" data-on={s.base === "week"}>
              <span className="mf-abs mf-tabs-h" style={pos(26, 62)}>
                <b>This week</b>
                <Icon icon={MoreVerticalIcon} color="#C7C7CC" size={18} w={2.2} />
                <span>All notes</span>
              </span>
              <span className="mf-abs mf-round" style={pos(319, 51, 36, 36)}>
                <Icon icon={ArrowLeftRightIcon} />
              </span>
              <div className={`mf-abs mf-page${s.card ? " is-on" : ""}`} style={pos(21.4, 103, 161, 194)}>
                <b>Question</b>
                <span className="mf-page-img">
                  <img src={`${F}page.webp`} alt="" />
                </span>
                <span className="mf-page-foot">
                  <Icon icon={ArrowLeft01Icon} color="#fff" size={11} w={2.4} />
                  Today
                  <Icon icon={ArrowRight01Icon} color="rgba(255,255,255,0.4)" size={11} w={2.4} />
                </span>
              </div>
            </section>

            {/* Tab bar: Practice and Notes. */}
            <div className="mf-abs mf-tabbar" data-on={(practice && (s.stage === "idle" || s.stage === "done")) || s.base === "week"} data-tab={s.tab} style={pos(88, 707, 200, 56)}>
              <i />
              <span>
                <Icon icon={BookEditIcon} color={s.tab === 0 ? "#242424" : "#8E8E93"} />
              </span>
              <span>
                <Icon icon={BookCheckIcon} color={s.tab === 1 ? "#242424" : "#8E8E93"} />
              </span>
            </div>

            {/* ---------------------------------------------------- Photo sheet */}
            <section className="mf-sheet mf-paper" data-on={s.sheet === "photo"} data-photo={s.photo}>
              <img className="mf-abs mf-close" src={`${F}close.svg`} alt="" style={pos(16, 63, 20, 20)} />

              {/* Allow the camera */}
              <div className="mf-part" data-part="allow">
                <span className="mf-abs mf-eyebrow" style={pos(0, 63, 375)}>
                  Photo of your page
                </span>
                <span className="mf-abs mf-round mf-round--big" style={pos(155.5, 236, 64, 64)}>
                  <Icon icon={Camera01Icon} size={28} />
                </span>
                <h4 className="mf-abs mf-head" style={pos(0, 324, 375)}>
                  Allow the camera
                </h4>
                <p className="mf-abs mf-body mf-body--block" style={pos(37.5, 380, 300)}>
                  Margin uses your camera only to photograph your page. Your photo stays on your phone. Only you can see it.
                </p>
                <span className="mf-abs mf-btn" style={pos(81, 663, 213, 54)}>
                  <Icon icon={Camera01Icon} color="#fff" size={20} w={1.8} />
                  Allow camera
                </span>
                <span className="mf-abs mf-text-btn" style={pos(0, 735, 375)}>
                  Save without a photo
                </span>
              </div>

              {/* Camera and check share the picture. */}
              <span className="mf-abs mf-eyebrow" data-part="camera" style={pos(0, 63, 375)}>
                Photo of your page
              </span>
              <span className="mf-abs mf-eyebrow" data-part="check" style={pos(0, 63, 375)}>
                Your page
              </span>
              <div className="mf-abs mf-view" data-locked={s.locked} data-blur={s.blur} style={pos(16, 100, 343, 457)}>
                <img src={`${F}page.webp`} alt="" />
                <span className="mf-corners">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                {s.shot > 0 && <span key={s.shot} className="mf-flash" />}
              </div>
              <span className="mf-abs mf-body" data-part="camera" style={pos(0, 573, 375)}>
                Fit your whole page inside the corners.
              </span>
              <span className="mf-abs mf-shutter" data-part="camera" style={pos(149.5, 660, 76, 76)}>
                <i />
              </span>
              <span className="mf-abs mf-body" data-part="check" style={pos(0, 573, 375)}>
                Can you read it? If it’s blurry, take it again.
              </span>
              <span className="mf-abs mf-btn" data-part="check" style={pos(91, 663, 193, 54)}>
                Save page
              </span>
              <span className="mf-abs mf-text-btn" data-part="check" style={pos(0, 735, 375)}>
                Retake
              </span>

              {/* Gap closed */}
              <div className="mf-part mf-paper" data-part="gap">
                <span className="mf-abs mf-eyebrow" style={pos(0, 63, 375)}>
                  Gap closed
                </span>
                <h4 className="mf-abs mf-head" style={pos(0, 128, 375)}>
                  Same time tomorrow?
                </h4>
                <p className="mf-abs mf-body mf-body--tight" style={pos(0, 180, 375)}>
                  A gentle nudge each day, at the time you choose.
                  <br />
                  No reminder on days you’ve already practised.
                </p>
                <div className="mf-abs mf-card mf-wheel" style={pos(16, 264, 343, 168)}>
                  <i className="mf-wheel-sel" />
                  <Wheel items={HOURS.map(String)} sel={s.hour} x={112.5} />
                  <span className="mf-wheel-colon">:</span>
                  <Wheel items={MINS.map(String)} sel={s.min} x={161} />
                  <Wheel items={["AM", "PM"]} sel={1} x={248} />
                </div>
                <span className="mf-abs mf-btn" style={pos(87, 663, 201, 54)}>
                  <Icon icon={Notification01Icon} color="#fff" size={20} w={1.8} />
                  Set reminder
                </span>
                <span className="mf-abs mf-text-btn" style={pos(0, 735, 375)}>
                  Not now
                </span>
              </div>
            </section>

            {/* ---------------------------------------------------- Settings sheet */}
            <section className="mf-sheet mf-paper" data-on={s.sheet === "settings"}>
              <img className="mf-abs mf-close" src={`${F}close.svg`} alt="" style={pos(16, 63, 20, 20)} />
              <span className="mf-abs mf-eyebrow" style={pos(0, 63, 375)}>
                Settings
              </span>
              <span className="mf-abs mf-label" style={pos(32, 116)}>
                Reminder
              </span>
              <div className="mf-abs mf-card mf-set" style={pos(16, 140, 343, 108)}>
                <span className="mf-set-l" style={pos(16, 17)}>
                  Daily reminder
                </span>
                <span className={`mf-switch${s.remind ? " is-on" : ""}`} style={pos(276, 11.5)}>
                  <i />
                </span>
                <i className="mf-rule" style={pos(16, 54, 311)} />
                <span className="mf-set-l" style={pos(16, 71)}>
                  Time
                </span>
                <span className={`mf-time${s.remind ? " is-on" : ""}`} style={pos(248, 64, 79, 32)}>
                  7:45 PM
                </span>
              </div>
              <span className="mf-abs mf-small" style={pos(32, 256, 311)}>
                No reminder on days you’ve already practised.
              </span>
              <span className="mf-abs mf-label" style={pos(32, 300)}>
                Margin
              </span>
              <div className="mf-abs mf-card mf-set" style={pos(16, 324, 343, 54)}>
                <span style={pos(16, 17)} className="mf-set-i">
                  <Icon icon={Share03Icon} />
                </span>
                <span className="mf-set-l" style={pos(46, 17)}>
                  Share Margin
                </span>
                <span style={pos(311, 19)} className="mf-set-i">
                  <Icon icon={ArrowRight01Icon} color="#8E8E93" size={16} />
                </span>
              </div>
              <span className="mf-abs mf-small" style={pos(32, 386, 311)}>
                Invite a friend to close the gap. Your notes are never shared.
              </span>
              <span className={`mf-abs mf-small mf-private${s.remind ? " is-on" : ""}`} style={pos(0, 740, 375)}>
                Your notes stay on this phone. Nothing is uploaded.
              </span>
            </section>

            {/* iOS asks first. */}
            <div className="mf-alert" data-on={s.alert !== null}>
              <div className="mf-alert-box">
                <b>{alertKind === "notify" ? "“Margin” Would Like to Send You Notifications" : "“Margin” Would Like to Access the Camera"}</b>
                <p>
                  {alertKind === "notify"
                    ? "Notifications may include alerts, sounds and icon badges. These can be configured in Settings."
                    : "Margin uses your camera only to photograph your page."}
                </p>
                <span className="mf-alert-btns">
                  <span>Don’t Allow</span>
                  <span>Allow</span>
                </span>
              </div>
            </div>
          </div>

          {/* Always on top: status bar, island, home bar, and the tap. */}
          <div className={`gf-status mf-status${s.base === "safari" ? " is-hidden" : ""}${s.base === "home" ? " is-light" : ""}`}>
            <span>{flow === "home" ? "9:48" : "9:41"}</span>
            <span className="gf-status-r">
              <IconSignal />
              <IconWifi />
              <span className="gf-batt" />
            </span>
          </div>
          <span className="gf-island" />
          <span className="gf-home" />
          {s.tap && (
            <span
              key={s.tap.k}
              className={`gf-tap${s.tap.dy ? " mf-drag" : ""}`}
              style={{ left: s.tap.x, top: s.tap.y, "--dy": `${s.tap.dy ?? 0}px` } as CSSProperties}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// A column of the time wheel: the chosen row in the middle, the rest fading.
function Wheel({ items, sel, x }: { items: string[]; sel: number; x: number }) {
  return (
    <span className="mf-col" style={{ left: x, transform: `translateY(${(2 - sel) * 32}px)` }}>
      {items.map((v, i) => (
        <i key={v} data-d={Math.min(Math.abs(i - sel), 3)}>
          {v}
        </i>
      ))}
    </span>
  );
}
