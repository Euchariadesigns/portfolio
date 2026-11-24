import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { CoverInView } from "@/components/covers/Cover";
import Cursor from "@/components/Cursor";
import SiteNav from "@/components/SiteNav";
import { projects } from "@/lib/projects";
import type { ProjectId } from "@/lib/projects";
import "./work.css";

export const metadata: Metadata = {
  title: "Work · Eucharia Odili",
  description: "Product design work by Eucharia Odili: Margin, Ejara savings and investment products, and a crime documentation system.",
};

/*
  All the work, as a gallery: two columns of tiles that settle into each
  other (a masonry grid), each showing the product on its own colour, with a
  caption underneath. Layout after ajanwachuku.work/work, without the side note.
*/

type Tile = {
  id: ProjectId;
  /** Height of the picture, in px, on desktop. */
  h: number;
  kind: string;
};

// Each tile plays the project's cover (the real product flow), like Jenn
// Choi's work grid.
const TILES: Tile[] = [
  { id: "margin", h: 700, kind: "Product + Engineering" },
  { id: "goal-savings", h: 640, kind: "Product Design" },
  { id: "crime-doc", h: 500, kind: "Product + Systems Design" },
  { id: "group-savings", h: 460, kind: "Product Design" },
  { id: "savings-box", h: 440, kind: "Product Design" },
  { id: "bond", h: 440, kind: "Product + UX Writing" },
];

const ROW = 8; // the grid's row unit, in px
const CAPTION = 56; // caption and space under each tile

function background(id: ProjectId): CSSProperties {
  const { box } = projects.find((p) => p.id === id)!;
  return {
    backgroundColor: box.color,
    backgroundImage: box.image,
    backgroundSize: box.size,
    backgroundPosition: "center",
    // The card visuals inside read the same colour.
    "--box": box.color,
    "--box-image": box.image,
    "--box-size": box.size,
  } as CSSProperties;
}

export default function WorkPage() {
  return (
    <div className="wk2">
      <div className="wk2-bar">
        <SiteNav current="work" />
      </div>

      <main className="wk2-main">
        <h1 className="wk2-title">Work</h1>
        <ul className="wk2-grid">
          {TILES.map((t) => {
            const p = projects.find((x) => x.id === t.id)!;
            const external = p.href.startsWith("http");
            return (
              <li
                key={t.id}
                className="wk2-item"
                style={{ "--h": `${t.h}px`, gridRowEnd: `span ${Math.ceil((t.h + CAPTION) / ROW)}` } as CSSProperties}
              >
                <a href={p.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} className="wk2-link">
                  <div className={`wk2-pic ink-${p.box.ink}`} style={background(t.id)}>
                    <CoverInView id={t.id} />
                  </div>
                  <div className="wk2-cap">
                    <h2>
                      {p.title.replace(/^Ejara /, "")}
                      <span>© {p.year}</span>
                    </h2>
                    <span className="wk2-kind">{t.kind}</span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </main>

      <footer className="footer wk2-foot">
        <span>© 2026 Eucharia Odili</span>
        <span className="footer-links">
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
      </footer>
      <Cursor />
    </div>
  );
}
