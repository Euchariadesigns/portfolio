import bond from "./cases/bond.json";
import crimeDoc from "./cases/crime-doc.json";
import goalSavings from "./cases/goal-savings.json";
import groupSavings from "./cases/group-savings.json";
import margin from "./cases/margin.json";
import savingsBox from "./cases/savings-box.json";
import type { ProjectId } from "./projects";

/*
  Case studies, ported from the Framer portfolio with their original words.
  Each one is a list of sections (the left-hand navigation) made of blocks.
  Inline text supports **bold**, *italic* and [links](url).
*/

export type Media = {
  /** "cover": the project's animated phone from the work page (see `cover`). */
  kind: "image" | "video" | "cover";
  cover?: ProjectId;
  src: string;
  poster?: string;
  w: number;
  h: number;
  caption?: string;
  /** The image brings its own background: it fills the panel, no padding. */
  fill?: boolean;
  /** Sits straight on the page, with no container (as on the old site). */
  plain?: boolean;
  /** Its edge colour, used to fill a taller tile when paired. */
  bg?: string;
};

export type Block =
  | { t: "p"; text: string }
  | { t: "lead"; text: string }
  | { t: "quote"; text: string; color?: string }
  | { t: "h"; text: string }
  | { t: "h4"; text: string }
  | { t: "list"; items: string[]; big?: boolean; color?: string }
  /** `todo`: a picture still to come; kept with its caption, not shown yet. */
  | { t: "media"; items: Media[]; wide?: boolean; todo?: string };

export type Section = { id: string; nav: string; title: string; blocks: Block[] };

export type CaseStudy = {
  slug: string;
  project: string;
  title: string;
  headline: string;
  /** A short paragraph under the headline: what it is, and what she did. */
  summary: string;
  skills: string[];
  /** The container behind the visuals, from the previous portfolio. The
      texture is an image path, or a CSS gradient. */
  box: { color: string; texture: string; size: string };
  /** The live product, linked under the summary. */
  live?: { label: string; href: string };
  hero: Media;
  meta: { label: string; value: string }[];
  sections: Section[];
  next: string;
};

export const CASES: Record<string, CaseStudy> = Object.fromEntries(
  [margin, goalSavings, crimeDoc, groupSavings, savingsBox, bond].map((c) => [c.slug, c as CaseStudy]),
);

export const caseHref = (slug: string) => `/work/${slug}`;
