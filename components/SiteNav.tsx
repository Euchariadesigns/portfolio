import Link from "next/link";
import type { CSSProperties } from "react";
import Soon from "./Soon";
import SoundToggle from "./SoundToggle";

/*
  The top navigation, shared by the home, work and about pages.
  Explorations is still being built: it shows a "soon" tag (Soon.tsx).
*/
export const RESUME = "/eucharia-odili-resume.pdf";
const GITHUB = "https://github.com/Euchariadesigns";

export default function SiteNav({ current, reveal = false }: { current?: "work" | "about"; reveal?: boolean }) {
  return (
    <nav className={`nav${reveal ? " reveal" : ""}`} style={reveal ? ({ "--r": 0 } as CSSProperties) : undefined}>
      <Link href="/" className="nav-name nav-logo" aria-label="Eucharia Odili, home">
        E
        <span className="nav-logo-dot" aria-hidden="true" />
      </Link>
      <div className="nav-links">
        <Link href="/work" aria-current={current === "work" ? "page" : undefined}>
          Work
        </Link>
        <Soon className="soon--nav">Explorations</Soon>
        <Link href="/about" aria-current={current === "about" ? "page" : undefined}>
          About me
        </Link>
        <a href={RESUME} target="_blank" rel="noreferrer">
          Resume
        </a>
        {GITHUB ? (
          <a href={GITHUB} target="_blank" rel="noreferrer">
            GitHub
          </a>
        ) : null}
        <SoundToggle />
      </div>
    </nav>
  );
}
