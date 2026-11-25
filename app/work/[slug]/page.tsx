import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import CaseNav from "@/components/case/CaseNav";
import CaseVideo from "@/components/case/CaseVideo";
import { CoverInView } from "@/components/covers/Cover";
import Rich from "@/components/case/Rich";
import Link from "next/link";
import PageFade from "@/components/PageFade";
import ProjectIcon from "@/components/ProjectIcon";
import { CASES, caseHref } from "@/lib/cases";
import type { Block, Media } from "@/lib/cases";
import { projects } from "@/lib/projects";
import "../case.css";

/*
  A case study. Laid out like a long read: the sections down the left (the one
  you are in is highlighted), the story on the right, section by section. The
  structure follows the Crime Documentation case study; the words are
  Eucharia's own, from her Framer portfolio.
*/

export function generateStaticParams() {
  return Object.keys(CASES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) return {};
  return { title: `${c.title} · Eucharia Odili`, description: c.headline };
}

// The live product, as a dark pill under the summary.
function LiveLink({ live }: { live: { label: string; href: string } }) {
  return (
    <a className="cs-live" href={live.href} target="_blank" rel="noreferrer">
      {live.label}
      <ArrowUpRight aria-hidden="true" />
    </a>
  );
}

// A picture's shape and natural width, so its box is the right size before
// the file arrives (see .cs-panel img).
function shape(w: number, h: number) {
  return { "--ar": w / h, "--w": `${w}px` } as CSSProperties;
}

// `ratio`: when paired with a taller visual, this one sits centred in a tile
// of that shape, filled with its own edge colour, so both are the same height.
function MediaItem({ m, ratio }: { m: Media; ratio?: number }) {
  if (m.plain) {
    const media =
      m.kind === "video" ? (
        <CaseVideo src={m.src} poster={m.poster} w={m.w} h={m.h} label={m.caption ?? "Product recording"} />
      ) : (
        <img src={m.src} alt={m.caption ?? ""} width={m.w} height={m.h} loading="lazy" decoding="async" />
      );
    return (
      <figure className="cs-fig cs-fig--plain">
        {ratio ? (
          <div className="cs-tile" style={{ aspectRatio: ratio, background: m.bg } as CSSProperties}>
            {media}
          </div>
        ) : (
          media
        )}
        {m.caption ? <figcaption>{m.caption}</figcaption> : null}
      </figure>
    );
  }
  return (
    <figure className="cs-fig">
      <div className={`cs-panel${m.kind === "video" ? " cs-panel--video" : ""}${m.fill ? " cs-panel--fill" : ""}`}>
        {m.kind === "video" ? (
          <CaseVideo src={m.src} poster={m.poster} w={m.w} h={m.h} label={m.caption ?? "Product recording"} />
        ) : (
          <img src={m.src} alt={m.caption ?? ""} width={m.w} height={m.h} loading="lazy" decoding="async" style={shape(m.w, m.h)} />
        )}
      </div>
      {m.caption ? <figcaption>{m.caption}</figcaption> : null}
    </figure>
  );
}

function BlockView({ b }: { b: Block }) {
  switch (b.t) {
    case "p":
      return (
        <p className="cs-p">
          <Rich text={b.text} />
        </p>
      );
    case "lead":
      return (
        <p className="cs-lead">
          <Rich text={b.text} />
        </p>
      );
    case "quote":
      return (
        <p className="cs-quote" style={b.color ? ({ color: b.color } as CSSProperties) : undefined}>
          <Rich text={b.text} />
        </p>
      );
    case "h":
      return (
        <h3 className="cs-h3">
          <Rich text={b.text} />
        </h3>
      );
    case "h4":
      return <h4 className="cs-h4">{b.text}</h4>;
    case "list":
      return (
        <ul
          className={`cs-list${b.big ? " cs-list--big" : ""}`}
          style={b.color ? ({ "--result": b.color } as CSSProperties) : undefined}
        >
          {b.items.map((it, i) => (
            <li key={i}>
              <Rich text={it} />
            </li>
          ))}
        </ul>
      );
    case "screens":
      return (
        <figure className="cs-fig cs-media">
          <div className="cs-panel cs-screens" style={{ "--n": b.items.length } as CSSProperties}>
            {b.items.map((s) => (
              <img key={s.src} src={s.src} alt={s.alt} width={750} height={1706} loading="lazy" decoding="async" />
            ))}
          </div>
          {b.caption ? <figcaption>{b.caption}</figcaption> : null}
        </figure>
      );
    case "media": {
      if (b.todo) return null; // waiting for the picture
      // Side by side visuals of different shapes: match the tallest.
      const shapes = b.items.map((m) => m.w / m.h);
      const tallest = Math.min(...shapes);
      const uneven = b.items.length > 1 && Math.max(...shapes) - tallest > 0.02;
      return (
        <div className={`cs-media${b.items.length > 1 ? " cs-media--pair" : ""}`}>
          {b.items.map((m) => (
            <MediaItem
              key={m.src}
              m={m}
              // Only images: browsers draw video colours slightly differently from CSS,
              // so videos are padded to shape in the file itself instead.
              ratio={uneven && m.plain && m.bg && m.kind === "image" ? tallest : undefined}
            />
          ))}
        </div>
      );
    }
  }
}

export default async function CasePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = CASES[slug];
  if (!c) notFound();
  const project = projects.find((p) => p.id === c.project);
  const next = CASES[c.next];
  const nextProject = next ? projects.find((p) => p.id === next.project) : undefined;

  return (
    <PageFade>
      <div
        className="cs"
        style={
          {
            "--surface": project?.surface.color ?? "#F2F7FD",
            "--box": c.box.color,
            "--box-texture": c.box.texture.startsWith("/") ? `url(${c.box.texture})` : c.box.texture,
            "--box-size": c.box.size,
          } as CSSProperties
        }
      >
        <aside className="cs-side">
          <Link className="cs-back" href="/">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M12.5 8h-9M7.5 4l-4 4 4 4" />
            </svg>
            Back home
          </Link>
          <CaseNav sections={[{ id: "overview", nav: "Overview" }, ...c.sections.map((s) => ({ id: s.id, nav: s.nav }))]} />
        </aside>

        <main className="cs-main">
          <header id="overview" className="cs-head">
            <p className="cs-crumb">
              {project ? <ProjectIcon project={project} /> : null}
              <span>{c.title}</span>
            </p>
            <h1>{c.headline}</h1>
            <p className="cs-summary">{c.summary}</p>
            {c.live ? <LiveLink live={c.live} /> : null}
            <dl className="cs-meta">
              {c.meta.map((m) => (
                <div key={m.label}>
                  <dt>{m.label}</dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
              <div className="cs-meta-skills">
                <dt>Skills</dt>
                <dd>
                  <ul className="cs-chips">
                    {c.skills.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
            <div className="cs-hero">
              <div className={`cs-panel cs-panel--hero${c.hero.kind === "video" ? " cs-panel--video" : ""}${c.hero.kind === "cover" ? " cs-panel--cover" : ""}`}>
                {c.hero.kind === "cover" && c.hero.cover ? (
                  <div className="cs-cover">
                    <CoverInView id={c.hero.cover} />
                  </div>
                ) : c.hero.kind === "video" ? (
                  <CaseVideo src={c.hero.src} poster={c.hero.poster} w={c.hero.w} h={c.hero.h} label={c.title} />
                ) : (
                  <img src={c.hero.src} alt={c.title} width={c.hero.w} height={c.hero.h} fetchPriority="high" style={shape(c.hero.w, c.hero.h)} />
                )}
              </div>
            </div>
          </header>

          {c.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="cs-section" aria-labelledby={`${s.id}-title`}>
              {/* The plain label from the left side, above her own heading (once per group). */}
              {c.sections[i - 1]?.nav === s.nav || s.title.toLowerCase().startsWith(s.nav.toLowerCase()) ? null : (
                <p className="cs-kicker">{s.nav}</p>
              )}
              <h2 id={`${s.id}-title`}>{s.title}</h2>
              {s.blocks.map((b, i) => (
                <BlockView key={i} b={b} />
              ))}
            </section>
          ))}

          <footer className="cs-end">
            <p className="cs-thanks">Thank you for reading</p>
            {next ? (
              <Link className="cs-next" href={caseHref(next.slug)}>
                <span className="cs-next-label">Next project</span>
                <span className="cs-next-title">
                  {nextProject ? <ProjectIcon project={nextProject} /> : null}
                  {next.title}
                </span>
                <span className="cs-next-line">{next.headline}</span>
                <svg className="cs-next-arrow" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M3.5 8h9M8.5 4l4 4-4 4" />
                </svg>
              </Link>
            ) : null}
            <div className="cs-foot">
              <span>© 2026 Eucharia Odili</span>
              <span>
                <a href="https://dribbble.com/Eucharia_Odili" target="_blank" rel="noreferrer">
                  Dribbble
                </a>
                <a href="https://www.linkedin.com/in/eucharia-odili-730248210/" target="_blank" rel="noreferrer">
                  LinkedIn
                </a>
                <a href="https://x.com/Euchariadesigns" target="_blank" rel="noreferrer">
                  X
                </a>
              </span>
            </div>
          </footer>
        </main>
      </div>
    </PageFade>
  );
}
