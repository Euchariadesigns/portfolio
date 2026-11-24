"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { ProjectId } from "@/lib/projects";
import GoalFlow from "./GoalFlow";

/*
  Every visual is a grid of cells divided by hairlines, the way the tiles are
  laid out in the Figma portfolio. Inside a cell:
    data-in    fades in from a soft blur
    data-move  fades in while easing from --from to --to
  Both wait for the card to finish opening, then stagger by --d.
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

/*
  The tiles appear when the card opens (`active`). The story inside them plays
  while `play` is true. Visuals without their own motion replay it in a loop,
  like a short product video: the content fades away and plays again, while
  the tiles stay where they are.
*/
function Frame({
  id,
  active,
  play = active,
  again = false,
  children,
}: {
  id: string;
  active: boolean;
  play?: boolean;
  again?: boolean;
  children: ReactNode;
}) {
  return <div className={`v v-${id}${active ? " on" : ""}${play ? " play" : ""}${again ? " again" : ""}`}>{children}</div>;
}

function useReplay(active: boolean, period: number) {
  const [state, setState] = useState({ play: false, again: false });
  useEffect(() => {
    if (!active) {
      setState({ play: false, again: false });
      return;
    }
    setState({ play: true, again: false });
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let restart = 0;
    const loop = window.setInterval(() => {
      setState({ play: false, again: true });
      restart = window.setTimeout(() => setState({ play: true, again: true }), 520);
    }, period);
    return () => {
      window.clearInterval(loop);
      window.clearTimeout(restart);
    };
  }, [active, period]);
  return state;
}

function Cell({ area, className = "", children }: { area: string; className?: string; children?: ReactNode }) {
  return <div className={`cell a-${area} ${className}`}>{children}</div>;
}

function Phone({ src, delay = 0, top }: { src: string; delay?: number; top?: number }) {
  return (
    <img
      className="phone"
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      data-move
      style={{ ...mv(delay, "translate(-50%, 28px)", "translate(-50%, 0)"), ...(top !== undefined ? { top } : {}) }}
    />
  );
}

/* ================================================================== Margin */

// Illustrative answer, written the way it would be on paper.
const ANSWER = ["I used to think", "rest was earned.", "Now I think it's", "where good work", "begins."];

function MarginVisual({ active }: VProps) {
  const margin = useReplay(active, 9000);
  return (
    <Frame id="margin" active={active} {...margin}>
      <Cell area="l" className="mg-left">
        <div className="mg-copy">
          <p className="mg-title" data-in style={d(60)}>
            One question{" "}
            <span className="mg-u">
              a day.
              <svg className="mg-line" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true">
                <path d="M2 8.5C22 4.5 46 3.2 70 4.6c16 .9 30 2.4 48 1.4" />
              </svg>
            </span>
          </p>
          <p className="mg-sub" data-in style={d(180)}>
            Margin helps you get back the habit of thinking things through, one question at a time.
          </p>
        </div>
        <div className="mg-sheet" data-move style={mv(260, "rotate(-4deg) translateY(30px)", "rotate(-4deg)")}>
          {ANSWER.map((line, i) => (
            <span key={i} className="mg-hand" style={{ "--l": i } as CSSProperties}>
              {line}
            </span>
          ))}
        </div>
      </Cell>

      <Cell area="r" className="mg-right">
        <div className="mp-phone" data-move style={mv(120, "translate(-50%, 24px)", "translate(-50%, 0)")}>
          <div className="mp-screen">
            {/* Today's question, from the Margin designs in Figma. */}
            <img src="/work/margin/screen.png" alt="" />
            <span className="mp-island" />
          </div>
        </div>
      </Cell>
    </Frame>
  );
}

/* ============================================================ Goal Savings */

// One tile, one phone playing the create-a-goal flow. See GoalFlow.
function GoalVisual({ active }: VProps) {
  return (
    <Frame id="goal" active={active}>
      <Cell area="g" className="gf-cell">
        <GoalFlow active={active} />
      </Cell>
    </Frame>
  );
}

/* ============================================================= Savings Box */

function SavingsBoxVisual({ active }: VProps) {
  const box = useReplay(active, 6500);
  return (
    <Frame id="box" active={active} {...box}>
      <Cell area="p">
        <Phone src="/work/savings-box/phone.png" />
      </Cell>

      <Cell area="n" className="sb-notif">
        <span className="sb-ghost" data-move style={mv(260, "translateX(-24px)")} />
        <div className="sb-card" data-move style={mv(160, "translateX(-24px)")}>
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
      </Cell>

      <Cell area="c" className="sb-bonus">
        <span className="c-title sb-title" data-in style={d(60)}>
          Your cash bonus is here! <span className="emoji">🤑</span>
        </span>
        <img className="sb-coins" src="/work/savings-box/coins.svg" alt="" data-move style={mv(220, "translateY(26px)")} />
      </Cell>

      <Cell area="b" className="sb-boxcell">
        <div className="sb-box" data-in style={d(120)}>
          <img className="sb-box-base" src="/work/savings-box/coin-box.svg" alt="" />
          <img className="sb-box-coins" src="/work/savings-box/coin-box.svg" alt="" />
        </div>
      </Cell>

      <Cell area="r" className="sb-receipt">
        <img src="/work/savings-box/receipt.svg" alt="" data-in style={d(200)} />
      </Cell>
    </Frame>
  );
}

/* ====================================================== Group Goal Savings */

function GroupVisual({ active }: VProps) {
  const group = useReplay(active, 7500);
  return (
    <Frame id="group" active={active} {...group}>
      <Cell area="f" className="gr-foldercell">
        <div className="gr-photos">
          {[2, 1, 4, 3].map((n, i) => (
            <img
              key={n}
              src={`/work/group-savings/p${n}.png`}
              alt=""
              data-move
              style={mv(420 + i * 90, "translate(-50%, 40px) rotate(0deg)", `translate(calc(-50% + var(--x${i})), 0) rotate(var(--r${i}))`)}
            />
          ))}
        </div>
        <div className="gr-folder" data-in style={d(100)}>
          <img src="/work/group-savings/folder.svg" alt="" />
          <span>Group name</span>
        </div>
      </Cell>

      <Cell area="v" className="gr-valid">
        <span className="gr-vghost" data-move style={mv(240, "translate(-50%, 16px)", "translate(-50%, 0)")} />
        <div className="gr-vcard" data-move style={mv(140, "translate(-50%, 16px)", "translate(-50%, 0)")}>
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
      </Cell>

      <Cell area="e" className="gr-team">
        <div className="gr-who" data-in style={d(80)}>
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
        <span className="gr-tghost" data-move style={mv(300, "translateX(20px) rotate(4deg)", "rotate(4deg)")} />
        <div className="gr-total" data-move style={mv(200, "translateX(20px)")}>
          <small>Total contribution</small>
          <b>
            <Count to={120000} active={group.play} delay={group.again ? 500 : 1200} /> <i>XAF</i>
          </b>
          <span className="gr-save">+ Save</span>
        </div>
      </Cell>

      <Cell area="ph">
        <Phone src="/work/group-savings/phone.png" delay={120} top={26} />
      </Cell>
    </Frame>
  );
}

/* ========================================================= Bond Investment */

const BONDS = [
  { name: "BTA Gabon", by: "Gabon government", rate: "5%", date: "Dec 29, 2024", flag: "ga" },
  { name: "OTA Tchad", by: "Tchad government", rate: "4.5%", date: "July 18, 2025", flag: "td" },
  { name: "OTA Cameroun", by: "Cameroun government", rate: "6.5%", date: "Sep 20, 2026", flag: "cm" },
];

function BondVisual({ active }: VProps) {
  const bond = useReplay(active, 6500);
  return (
    <Frame id="bond" active={active} {...bond}>
      <Cell area="a" className="bd-bonds">
        <span className="bd-title" data-in style={d(60)}>
          Choose any
          <br />
          country&rsquo;s bond
        </span>
        {BONDS.map((b, i) => (
          <div key={b.name} className={`bd-card k${i}`} data-move style={mv(160 + i * 120, "translateY(22px)")}>
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
      </Cell>

      <Cell area="i" className="bd-infocell">
        <div className="bd-info" data-move style={mv(260, "translate(-16px, -50%)", "translate(0, -50%)")}>
          <span className="bd-i">i</span>
          <span>
            <b>Interest withdrawable on Sept 20, 2025.</b>
            <small>You will be able to withdraw your accrued interest starting from this date.</small>
          </span>
        </div>
      </Cell>

      <Cell area="p">
        <Phone src="/work/bond/phone.png" delay={100} top={-62} />
      </Cell>
    </Frame>
  );
}

/* =========================================================== Crime records */

function CrimeVisual({ active }: VProps) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    const id = window.setTimeout(() => {
      v.currentTime = 0;
      const p = v.play();
      if (p) p.catch(() => {});
    }, 700);
    return () => window.clearTimeout(id);
  }, [active]);

  return (
    <Frame id="crime" active={active}>
      <Cell area="l" className="cr-left">
        <span className="cr-title" data-in style={d(60)}>
          Find reported
          <br />
          case seamlessly...
        </span>
        <div className="cr-search" data-in style={d(200)}>
          <span className="cr-spin" />
          <span className="cr-text">
            <mark>Case RPF2035-1ws</mark> Sexual assault, female, 24 years old, Bariga lagos. On July 11th, 2025...
          </span>
        </div>
        <img className="cr-f cr-green" src="/work/crime-doc/folder-green.svg" alt="" data-move style={mv(200, "translateY(50px)")} />
        <img className="cr-f cr-yellow" src="/work/crime-doc/folder-yellow.svg" alt="" data-move style={mv(320, "translateY(50px)")} />
        <img className="cr-f cr-orange" src="/work/crime-doc/folder-orange.svg" alt="" data-move style={mv(260, "translateY(50px)")} />
      </Cell>
      <Cell area="r" className="cr-right">
        <div className="cr-screen" data-move style={mv(140, "translateY(18px)")}>
          <video ref={ref} src="/work/crime-doc/search.mp4" poster="/work/crime-doc/poster.jpg" muted loop playsInline preload="none" />
        </div>
      </Cell>
    </Frame>
  );
}

export default function Visual({ id, active }: { id: ProjectId; active: boolean }) {
  switch (id) {
    case "margin":
      return <MarginVisual active={active} />;
    case "goal-savings":
      return <GoalVisual active={active} />;
    case "savings-box":
      return <SavingsBoxVisual active={active} />;
    case "group-savings":
      return <GroupVisual active={active} />;
    case "bond":
      return <BondVisual active={active} />;
    case "crime-doc":
      return <CrimeVisual active={active} />;
  }
}
