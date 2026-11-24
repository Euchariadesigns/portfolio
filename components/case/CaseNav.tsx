"use client";

import { useEffect, useMemo, useState } from "react";

/*
  The case study's sections, down the left side, under plain labels anyone
  can follow (Context, Research, Solution, Testing...). Neighbouring sections
  that share a label are one entry. The entry you are reading is dark; the
  rest are quiet. Clicking one glides to the start of it.
*/
export default function CaseNav({ sections }: { sections: { id: string; nav: string }[] }) {
  // Group neighbouring sections that share a label.
  const groups = useMemo(() => {
    const out: { label: string; ids: string[] }[] = [];
    for (const s of sections) {
      const last = out[out.length - 1];
      if (last && last.label === s.nav) last.ids.push(s.id);
      else out.push({ label: s.nav, ids: [s.id] });
    }
    return out;
  }, [sections]);

  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const visible = new Map<string, boolean>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible.set(e.target.id, e.isIntersecting);
        // The first section (in page order) that crosses the reading line.
        const first = sections.find((s) => visible.get(s.id));
        if (first) {
          setActive(first.id);
          return;
        }
        // None does (a jump past the end, say): the last one that started
        // above the line.
        const line = window.innerHeight * 0.28;
        const above = els.filter((el) => el.getBoundingClientRect().top < line).pop();
        if (above) setActive(above.id);
      },
      { rootMargin: "-28% 0px -62% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [sections]);

  const go = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", `#${id}`);
    setActive(id);
  };

  return (
    <nav className="cs-nav" aria-label="Sections">
      <ol>
        {groups.map((g) => (
          <li key={g.ids[0]}>
            <a
              href={`#${g.ids[0]}`}
              onClick={go(g.ids[0])}
              aria-current={active && g.ids.includes(active) ? "true" : undefined}
            >
              {g.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
