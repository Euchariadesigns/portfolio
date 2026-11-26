/*
  Explorations: ideas Eucharia designs on her own. Each shows as a small
  window on /explorations (named like a file) playing the idea by itself;
  clicking it opens a bigger window with the idea and a short "about".

  The grid is Cindy Ly's: three columns, windows packed like a masonry.
  - "wide": a desktop screen or anything landscape. Spans two columns when
    a phone exploration comes right after it (they sit side by side, the
    same height), otherwise the full width (so there are never holes).
  - "tall": a phone. One column, the phone on white.
  Order matters: put a tall one right after the wide one it should pair with.
*/

export type Exploration = {
  id: "exomail" | "homeland" | "avelis" | "nutrientub" | "seoul" | "assistant" | "strata" | "tahseel";
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
  {
    id: "homeland",
    file: "homeland.clinic",
    title: "Homeland Clinic",
    kind: "Mobile UX exploration",
    tools: "Figma",
    about:
      "Waiting at a clinic is anxious when you can't see what's happening. I explored a check-in screen that keeps patients informed: a status ribbon that changes as the visit moves on, an estimated wait, who you're seeing and when, small things to do while you wait, and, when it's time, exactly where to go.",
    size: "tall",
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
    id: "nutrientub",
    file: "nutrientub.app",
    title: "Nutrientub",
    kind: "Mobile UX exploration",
    tools: "Figma",
    about:
      "A meal planning app for building a relationship with food that feels good for your body and kind to your mind. This is its first moment: opening the app to a plan made for you, here meals to help you gain weight, high in calories and rich in nutrients, with a short note on why.",
    size: "tall",
  },
  {
    id: "seoul",
    file: "beyond.seoul",
    title: "Beyond Seoul",
    kind: "Web design exploration",
    tools: "Figma",
    about:
      "서울 너머, Beyond Seoul: a travel site for South Korea beyond its capital. Every city tells a different story, from the coastal industrial heart of Ulsan to the living history of Gyeongju, yet most visitors stay in Seoul because they don't know what lies beyond. The site gives them a local lens: cities to explore, a vibe matcher, travel essentials, and what real travellers are saying. Drag the line to compare the wireframe with the final design.",
    size: "wide",
  },
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
    id: "tahseel",
    file: "tahseel.pay",
    title: "Tahseel",
    kind: "Mobile UX exploration",
    tools: "Figma",
    about:
      "Paying an invoice someone sent you, from your phone. Tahseel shows that the invoice is verified and who it is from, what it is for and when it is due, and lets you pay by card, bank or Apple Pay, or pay part of it. This is the whole flow, from the invoice to a confirmed payment and its receipt.",
    size: "tall",
  },
  {
    id: "assistant",
    file: "assistant.ai",
    title: "AI Assistant",
    kind: "Product design exploration",
    tools: "Figma",
    about:
      "The welcome to an AI assistant inside a police case management dashboard: a partner for case management, ready to guide, remind and assist. It introduces what it does: spotting crime patterns across Lagos so resources go where they're needed most, writing well-organised case reports, and searching cases to uncover related ones and hidden patterns.",
    size: "wide",
  },
];
