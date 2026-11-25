import type { Metadata } from "next";
import Explorations from "@/components/explore/Explorations";
import PageFade from "@/components/PageFade";
import SiteNav from "@/components/SiteNav";
import { explorations } from "@/lib/explorations";
import "../work/work.css";
import "./explore.css";

export const metadata: Metadata = {
  title: "Explorations · Eucharia Odili",
  description: "Ideas Eucharia Odili designs on her own: small problems she notices, designed through to see what actually helps.",
};

/*
  Explorations: ideas designed on her own time. Small windows that play each
  idea; click one for a bigger window and a short "about" (after Cindy Ly's).
*/
export default function ExplorationsPage() {
  return (
    <PageFade>
      <div className="wk2">
        <div className="wk2-bar">
          <SiteNav current="explorations" />
        </div>

        <main className="xp-main">
          <header className="xp-head">
            <h1>Explorations</h1>
            <p>Small problems I notice, and design my way through to see what actually helps.</p>
          </header>
          <Explorations items={explorations} />
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
      </div>
    </PageFade>
  );
}
