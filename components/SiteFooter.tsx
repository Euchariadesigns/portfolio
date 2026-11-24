"use client";

import { ArrowUp, Check, Copy, DribbbleLogo, GithubLogo, InstagramLogo, LinkedinLogo, TiktokLogo, XLogo } from "@phosphor-icons/react";
import { useState } from "react";
import { play } from "@/lib/sound";
import LagosTime from "./LagosTime";
import SayHi, { EMAIL } from "./SayHi";
import { RESUME } from "./SiteNav";
import SubstackMark from "./SubstackMark";

/*
  The home page footer: a sign-off with her name in the script of the nav
  mark, where to find her, her email (click to copy), and the time in Lagos.
*/

const ELSEWHERE = [
  { label: "Substack", href: "https://substack.com/@ukheriah", icon: <SubstackMark className="sf-sub" /> },
  { label: "Instagram", href: "https://www.instagram.com/ukheriah_", icon: <InstagramLogo aria-hidden="true" /> },
  { label: "X", href: "https://x.com/Euchariadesigns", icon: <XLogo aria-hidden="true" /> },
  { label: "TikTok", href: "https://www.tiktok.com/@ukheriah", icon: <TiktokLogo aria-hidden="true" /> },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/eucharia-odili-730248210/", icon: <LinkedinLogo aria-hidden="true" /> },
  { label: "Dribbble", href: "https://dribbble.com/Eucharia_Odili", icon: <DribbbleLogo aria-hidden="true" /> },
  { label: "GitHub", href: "https://github.com/Euchariadesigns", icon: <GithubLogo aria-hidden="true" /> },
];

export default function SiteFooter() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      play("tock");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  const top = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <footer className="sf">
      <div className="sf-main">
        <div className="sf-sign">
          <p className="sf-thanks">Thanks for stopping by.</p>
          <p className="sf-name" aria-label="Eucharia">
            Eucharia
            <span className="sf-dot" aria-hidden="true" />
          </p>
          <p className="sf-open">
            <span className="hero-dot" aria-hidden="true" />
            Open to product design roles
          </p>
        </div>

        <div className="sf-cols">
          <div>
            <h2>Elsewhere</h2>
            <ul>
              {ELSEWHERE.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    {l.icon}
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2>Say hi</h2>
            <ul>
              <li>
                <SayHi className="sf-mail" icon={false}>
                  {EMAIL}
                </SayHi>
                <button type="button" className={`sf-copy${copied ? " is-done" : ""}`} onClick={copy} aria-label="Copy email address">
                  {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
                  <span className="sf-copied" role="status">
                    {copied ? "Copied" : ""}
                  </span>
                </button>
              </li>
              <li>
                <a href={RESUME} target="_blank" rel="noreferrer">
                  Resume
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="sf-bar">
        <span>© 2026 Eucharia Odili. Designed and built by me.</span>
        <LagosTime />
        <button type="button" className="sf-top" onClick={top}>
          Back to top
          <ArrowUp aria-hidden="true" />
        </button>
      </div>
    </footer>
  );
}
