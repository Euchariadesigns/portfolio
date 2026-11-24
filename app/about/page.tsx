import type { Metadata } from "next";
import Cursor from "@/components/Cursor";
import LagosTime from "@/components/LagosTime";
import { RESUME } from "@/components/SiteNav";
import "./about.css";

export const metadata: Metadata = {
  title: "About · Eucharia Odili",
  description: "Eucharia Odili, product designer: biomedical engineer by training, designing fintech and AI products.",
};

/*
  About, in the layout of Jenn Choi's about page: a one-line opening, a strip
  of photos that drifts sideways, a few short paragraphs. Below them, the
  facts from her resume.

  Copy written from her resume and her own notes, for her to adjust.
*/

const PHOTOS = [1, 8, 2, 3, 4, 5, 6, 7].map((n) => `/about/${n}.webp`);

const EXPERIENCE = [
  { role: "Systems Designer", org: "Verified Graduate Tutors", years: "2026" },
  { role: "Product Designer", org: "Keepbook", years: "2025" },
  { role: "Mid Product Designer, Consumer Mobile App", org: "Ejara", years: "2024 – 2025" },
  { role: "UI Designer", org: "CKAN (open source)", years: "2023" },
];

function Strip() {
  // Two copies side by side, so the strip can drift without an end.
  const tiles = [...PHOTOS, ...PHOTOS];
  return (
    <div className="ab-strip" aria-label="Photos of Eucharia">
      <ul className="ab-track">
        {tiles.map((src, i) => (
          <li key={i} className="ab-photo" aria-hidden={i >= PHOTOS.length || undefined}>
            <img src={src} alt={i < PHOTOS.length ? "Eucharia" : ""} loading={i < 4 ? "eager" : "lazy"} decoding="async" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="ab">
      <header className="ab-top">
        <a className="ab-back" href="/">
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M12.5 8h-9M7.5 4l-4 4 4 4" />
          </svg>
          Back home
        </a>
        <LagosTime />
      </header>

      <main className="ab-main">
        <h1 className="ab-title">A curious observer of how people interact with the world.</h1>

        <Strip />

        <div className="ab-copy">
          <p>
            I trained as a biomedical engineer, where I specialised in human-centred medical device design. It taught me
            to watch how people actually use things before deciding what to build. Today I take products from research
            to design, and then build them in Claude Code, Lovable and Codex.
          </p>
          <p>
            For over four years I&rsquo;ve designed in fintech and financial management: savings, investment, virtual
            cards and cross-border payments at Ejara, AI-assisted invoice classification at Keepbook, and design systems
            at Ejara and CKAN. Lately I&rsquo;m building{" "}
            <a href="https://trymargin.expo.app/" target="_blank" rel="noreferrer">
              Margin
            </a>
            , an app that helps you get back the habit of thinking through things, and I built{" "}
            <a href="https://stratajournal.com/" target="_blank" rel="noreferrer">
              Strata
            </a>
            , a physical journal that keeps every thought on a thread.
          </p>
          <p>
            I write on{" "}
            <a href="https://substack.com/@ukheriah" target="_blank" rel="noreferrer">
              Substack
            </a>{" "}
            about what I believe, what I&rsquo;ve observed and how I think life should be, and I talk about design,
            humans and life in general on{" "}
            <a href="https://www.instagram.com/ukheriah_" target="_blank" rel="noreferrer">
              Instagram
            </a>
            ,{" "}
            <a href="https://x.com/Euchariadesigns" target="_blank" rel="noreferrer">
              X
            </a>{" "}
            and{" "}
            <a href="https://www.tiktok.com/@ukheriah" target="_blank" rel="noreferrer">
              TikTok
            </a>
            . When I&rsquo;m not designing, I&rsquo;m reading, yapping or watching K-drama, and I speak to students
            about how to get into tech.
          </p>
        </div>

        <section className="ab-facts" aria-label="Experience">
          <h2>Experience</h2>
          <ul>
            {EXPERIENCE.map((e) => (
              <li key={e.org}>
                <span className="ab-role">
                  {e.role}, <b>{e.org}</b>
                </span>
                <span className="ab-years">{e.years}</span>
              </li>
            ))}
          </ul>
          <h2>Also</h2>
          <ul>
            <li>
              <span className="ab-role">
                Invited speaker, Design Series Session 3: <b>&ldquo;Don&rsquo;t Design In Silence&rdquo;</b>
              </span>
              <span className="ab-years">2026</span>
            </li>
            <li>
              <span className="ab-role">
                B.Eng Biomedical Engineering, <b>Federal University of Technology Owerri</b>
              </span>
              <span className="ab-years" />
            </li>
          </ul>
          <p className="ab-more">
            <a href={RESUME} target="_blank" rel="noreferrer">
              Full resume&nbsp;&rarr;
            </a>
          </p>
        </section>
      </main>

      <footer className="ab-foot">
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
      </footer>
      <Cursor />
    </div>
  );
}
