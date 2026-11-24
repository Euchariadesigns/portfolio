"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectId } from "@/lib/projects";
import { BondVisual, GroupVisual, SavingsBoxVisual } from "../visuals/Cards";
import GoalFlow from "../visuals/GoalFlow";
import PhoneCover from "./PhoneCover";
import type { Step } from "./PhoneCover";

/*
  Each project's cover: the real product acting out its key moment, on loop.
  Used inside the open card on the home page and on the work page tiles.
  The colour behind it comes from the container.
*/

const S = (dir: string, n: number) => `/cover/${dir}/${n}.webp`;

// Real screens from the case studies, in the order a person would see them.
// Taps are where the finger lands, as a share of the screen's width and height.
const FLOWS: Partial<Record<ProjectId, Step[]>> = {
  bond: [
    { src: S("bond", 1), tap: [0.5, 0.925], hold: 1900 },
    { src: S("bond", 2), tap: [0.5, 0.19] },
    { src: S("bond", 3), tap: [0.5, 0.905], hold: 1900 },
    { src: S("bond", 4), hold: 2600 },
  ],
  "savings-box": [
    { src: S("savings-box", 1), tap: [0.73, 0.93], hold: 2100 },
    { src: S("savings-box", 2), tap: [0.85, 0.445], hold: 2100 },
    { src: S("savings-box", 3), hold: 2600 },
  ],
  "group-savings": [
    { src: S("group-savings", 1), tap: [0.8, 0.55] },
    { src: S("group-savings", 2), tap: [0.5, 0.952], hold: 1900 },
    { src: S("group-savings", 3), tap: [0.5, 0.927] },
    { src: S("group-savings", 4), tap: [0.5, 0.849] },
    { src: S("group-savings", 5), hold: 2600 },
  ],
};

export default function Cover({ id, active, contain = false }: { id: ProjectId; active: boolean; contain?: boolean }) {
  if (id === "goal-savings") return <GoalFlow active={active} contain={contain} />;
  if (id === "margin") {
    return (
      <PhoneCover
        active={active}
        label="Margin: opening the app, the welcome letter, today's question and the thinking timer"
        w={600}
        h={1298}
        video={{ src: "/cover/margin.mp4", poster: "/cover/margin.webp" }}
        contain={contain}
      />
    );
  }
  if (id === "crime-doc") return <InsetVideo active={active} src="/case/crime-doc/transcription.mp4" poster="/case/crime-doc/transcription.webp" label="Handwritten statements, turned into typed records" />;
  const steps = FLOWS[id];
  if (!steps) return null;
  return <PhoneCover active={active} label="" w={554} h={1200} steps={steps} contain={contain} />;
}

// A desktop recording, inset on the colour like a screen on a desk.
function InsetVideo({ active, src, poster, label }: { active: boolean; src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (!active) {
      v.pause();
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const p = v.play();
    if (p) p.catch(() => {});
  }, [active]);
  return (
    <div className="cv-inset">
      <video ref={ref} src={src} poster={poster} width={1920} height={1080} muted loop playsInline preload="metadata" aria-label={label} />
    </div>
  );
}

// For the work page: plays while the tile is on screen. Savings Box, Group
// Goal Savings and Bond show their animated cards; the others their cover.
export function CoverInView({ id }: { id: ProjectId }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: "0px 0px 120px 0px" });
    io.observe(el);
    // The mockup scales into its tile once, when a fifth of the tile is on
    // screen. The right-hand column follows the left a beat later.
    const seen = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        const r = e.boundingClientRect;
        if (r.left > window.innerWidth / 2) el.style.setProperty("--grow-delay", "140ms");
        setShown(true);
        seen.disconnect();
      },
      { threshold: 0.2 },
    );
    seen.observe(el);
    return () => {
      io.disconnect();
      seen.disconnect();
    };
  }, []);
  return (
    <div className={`cv-root${shown ? " is-shown" : ""}`} ref={ref}>
      {id === "savings-box" ? (
        <SavingsBoxVisual active={inView} />
      ) : id === "group-savings" ? (
        <GroupVisual active={inView} />
      ) : id === "bond" ? (
        <BondVisual active={inView} />
      ) : (
        <Cover id={id} active={inView} contain />
      )}
    </div>
  );
}
