"use client";

import { ArrowUpRight } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/*
  The nav on phones: everything sits behind a Menu button. Tap it and the
  links drop down in a small card; tap it again, tap outside, press Escape or
  pick a link and it closes. (On larger screens the links show inline and
  this stays hidden; see .nm in globals.css.)
*/
export default function NavMenu({ current, resume, github }: { current?: "work" | "about"; resume: string; github: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const [path, setPath] = useState(pathname);
  if (path !== pathname) {
    // A page change closes the menu.
    setPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className={`nm${open ? " is-open" : ""}`} ref={ref}>
      <button type="button" className="nm-btn" aria-expanded={open} aria-controls="site-menu" onClick={() => setOpen((v) => !v)}>
        <span className="nm-word">{open ? "Close" : "Menu"}</span>
        <span className="nm-icon" aria-hidden="true">
          <i />
          <i />
        </span>
      </button>
      <div id="site-menu" className="nm-panel" inert={!open}>
        <ul>
          <li style={{ "--i": 0 } as React.CSSProperties}>
            <Link href="/work" aria-current={current === "work" ? "page" : undefined} onClick={close}>
              Work
            </Link>
          </li>
          <li style={{ "--i": 1 } as React.CSSProperties}>
            <span className="nm-soon">
              Explorations
              <span className="nm-tag">soon</span>
            </span>
          </li>
          <li style={{ "--i": 2 } as React.CSSProperties}>
            <Link href="/about" aria-current={current === "about" ? "page" : undefined} onClick={close}>
              About me
            </Link>
          </li>
          <li style={{ "--i": 3 } as React.CSSProperties}>
            <a href={resume} target="_blank" rel="noreferrer" onClick={close}>
              Resume
              <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
          <li style={{ "--i": 4 } as React.CSSProperties}>
            <a href={github} target="_blank" rel="noreferrer" onClick={close}>
              GitHub
              <ArrowUpRight aria-hidden="true" />
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
