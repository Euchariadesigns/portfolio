export type ProjectId =
  | "margin"
  | "goal-savings"
  | "crime-doc"
  | "group-savings"
  | "savings-box"
  | "bond";

export type Project = {
  id: ProjectId;
  title: string;
  summary: string;
  org: string;
  year: string;
  href: string;
  /** Card colour: Eucharia's pastels. The collapsed card wears it; so do the
      tiles inside the open card. */
  surface: { color: string };
  /** Text colour on that surface. All pastels take dark text. */
  tone: "light" | "dark";
  /** The project's colour from the previous portfolio: the work page tiles and
      the open card's tiles use it. `ink` is the text colour on it. */
  box: { color: string; image: string; size: string; ink: "light" | "dark" };
  icon:
    | { kind: "image"; src: string; round?: boolean }
    | { kind: "flags" };
};

// Order of the stack, top to bottom.
export const projects: Project[] = [
  {
    id: "margin",
    title: "Margin",
    summary: "Margin helps people get back into the habit of thinking through things.",
    org: "Founder",
    year: "2026",
    href: "https://trymargin.expo.app/",
    surface: { color: "#F2F7FD" },
    tone: "dark",
    box: { color: "#111214", image: "radial-gradient(70% 60% at 50% 70%, rgba(10, 132, 255, 0.28), transparent 70%)", size: "cover", ink: "light" },
    icon: { kind: "image", src: "/work/margin/icon.png" },
  },
  {
    id: "goal-savings",
    title: "Ejara Goal Savings",
    summary: "Making savings simple for Africans who just want to set money aside without confusion.",
    org: "Ejara",
    year: "2024",
    href: "/work/goal-savings",
    surface: { color: "#F6FBF3" },
    tone: "dark",
    box: { color: "#2b411e", image: "url(/case/goal-savings/texture.webp)", size: "cover", ink: "light" },
    icon: { kind: "image", src: "/work/goal-savings/e1.png" },
  },
  {
    id: "crime-doc",
    title: "Crime Documentation System",
    summary: "AI-assisted, care-informed case records for police stations.",
    org: "Solo project",
    year: "2025",
    href: "/work/crime-doc",
    surface: { color: "#FBF8EC" } /* not in the palette yet: a matching butter */,
    tone: "dark",
    box: { color: "#f1e4a9", image: "url(/case/crime-doc/texture.webp)", size: "cover", ink: "dark" },
    icon: { kind: "image", src: "/work/crime-doc/folder-orange.svg" },
  },
  {
    id: "group-savings",
    title: "Ejara Group Goal Savings",
    summary: "Making saving together safe, transparent, and stress free.",
    org: "Ejara",
    year: "2024",
    href: "/work/group-savings",
    surface: { color: "#F2F7FD" },
    tone: "dark",
    box: { color: "#9cbeeb", image: "url(/case/group-savings/texture.webp)", size: "660px auto", ink: "dark" },
    icon: { kind: "image", src: "/work/group-savings/m2.png", round: true },
  },
  {
    id: "savings-box",
    title: "Ejara Savings Box",
    summary: "Spare cash, set aside, with one free withdrawal a quarter.",
    org: "Ejara",
    year: "2024",
    href: "/work/savings-box",
    surface: { color: "#F4F3FC" },
    tone: "dark",
    box: { color: "#ad98fb", image: "url(/case/savings-box/texture.webp)", size: "600px auto", ink: "dark" },
    icon: { kind: "image", src: "/work/savings-box/coin-box.svg" },
  },
  {
    id: "bond",
    title: "Ejara Bond Investment",
    summary: "Government-backed bonds, reframed from saving to investing.",
    org: "Ejara",
    year: "2024",
    href: "/work/bond",
    surface: { color: "#F7FAF5" },
    tone: "dark",
    box: { color: "#639139", image: "url(/case/bond/texture.webp)", size: "cover", ink: "light" },
    icon: { kind: "flags" },
  },
];
