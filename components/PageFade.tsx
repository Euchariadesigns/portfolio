import { ViewTransition } from "react";
import type { ReactNode } from "react";

/*
  Moving between pages: the page you leave fades out quickly, and the next
  one fades in as it settles up a few pixels (styles in globals.css). Next.js
  runs every page change as a React transition, so this plays on its own.
  Browsers without view transitions simply swap the page.
*/
export default function PageFade({ children }: { children: ReactNode }) {
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      {children}
    </ViewTransition>
  );
}
