/*
  Explorations: ideas Eucharia designs on her own. Each shows as a small
  window on /explorations (named like a file) playing the idea by itself;
  clicking it opens a bigger window with the idea and a short "about".
*/

export type Exploration = {
  id: "exomail";
  /** The window's name, like a file: "exomail.app". */
  file: string;
  title: string;
  kind: string;
  tools: string;
  /** A few sentences, in her words. */
  about: string;
  /** Takes the full width of the grid. */
  wide?: boolean;
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
    wide: true,
  },
];
