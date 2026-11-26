/*
  Explorations: ideas Eucharia designs on her own. Each shows as a small
  window on /explorations (named like a file) playing the idea by itself;
  clicking it opens a bigger window with the idea and a short "about".

  The grid is Cindy Ly's: three columns, windows packed like a masonry.
  - "wide": a desktop screen or anything landscape. Spans two columns when a
    phone exploration sits beside it, otherwise the full width (so there are
    never empty holes).
  - "tall": a phone. One column, the phone centred on white.
  Order matters: put a tall one after each wide one to pair them.
*/

export type Exploration = {
  id: "exomail" | "avelis" | "strata";
  /** The window's name, like a file: "exomail.app". */
  file: string;
  title: string;
  kind: string;
  tools: string;
  /** A few sentences, in her words. */
  about: string;
  size: "wide" | "tall";
  /** A link under the about, e.g. the live product. */
  link?: { label: string; href: string };
};

export const explorations: Exploration[] = [
  {
    id: "exomail",
    file: "exomail.app",
    title: "Email Notification Categories",
    kind: "UX exploration",
    tools: "Figma",
    about:
      "I explored how people manage email overload, and how notification sounds that all sound the same add to anxiety, false urgency and constant inbox checking. This design makes notifications more intentional: emails are sorted into meaningful categories, and you choose how each one alerts you. The goal is to help people separate what matters from the noise, cut unnecessary interruptions, and feel more in control of their inbox.",
    size: "wide",
  },
  {
    id: "avelis",
    file: "avelis.health",
    title: "Avelis Health",
    kind: "UX exploration",
    tools: "Figma",
    about:
      "A claims review and dispute workflow. I explored how claims reviewers and health plan teams keep track of flagged billing errors. The focus was a clear, simple flow that helps non-technical people understand complex healthcare claims with confidence: why a claim was flagged, what the contract says, and how the dispute Avelis is handling is going.",
    size: "wide",
  },
  {
    id: "strata",
    file: "strata.journal",
    title: "Strata",
    kind: "Physical product",
    tools: "Figma, Claude",
    about:
      "Strata is a physical journal that keeps every thought on a thread. Three rhythms share one book: Build Day pages for the work of each day, a Reflect page every seventh page, and a Monthly page to look back and set what comes next. These are its pages, turning as they do in the book.",
    size: "wide",
    link: { label: "stratajournal.com", href: "https://stratajournal.com/" },
  },
];
