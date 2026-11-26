"use client";

import type { CSSProperties } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  ArrowRightDoubleIcon,
  Delete02Icon,
  Flag02Icon,
  InboxIcon,
  InformationCircleIcon,
  MoreVerticalIcon,
  NoteEditIcon,
  Notification01Icon,
  PaintBoardIcon,
  Search01Icon,
  SentIcon,
  Settings02Icon,
  SquareLock02Icon,
  StarIcon,
  Tick02Icon,
  UserIcon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons";
import { Recording, script, useRecording } from "./recording";
import type { Cam } from "./recording";
import "./exomail.css";

/*
  EXOMAIL (an exploration): notification categories in an email app, playing
  by itself like a Screen Studio recording. A cursor moves and clicks, and
  the view glides in to whatever it is touching, then eases back out.

  Built from Eucharia's Figma screens (1440 x 918): Notifications, and the
  Primary emails page with its sound list. The rest of the flow is drawn in
  the same style: the delivery menu, moving an email to Secondary (with an
  Undo), and the Secondary emails page with its quieter sounds.

  It plays while `active` and starts over each time.
*/

const W = 1440;
const H = 918;

type Page = "notif" | "primary" | "secondary";

type S = {
  page: Page;
  delivery: string;
  deliveryOpen: boolean;
  soundOpen: boolean;
  sound: string;
  hover: number | null;
  thread: boolean;
  moved: boolean;
  toast: boolean;
  cursor: [number, number];
  click: number;
  cam: Cam;
  fade: boolean;
  still: boolean;
};

const WIDE: Cam = [W / 2, H / 2, 1];

const START: S = {
  page: "notif",
  delivery: "Email only",
  deliveryOpen: false,
  soundOpen: false,
  sound: "Chime",
  hover: null,
  thread: false,
  moved: false,
  toast: false,
  cursor: [780, 640],
  click: 0,
  cam: WIDE,
  fade: false,
  still: false,
};

// Where things are, in the Figma frame's points.
const AT = {
  deliveryPill: [1288, 295],
  emailPush: [1170, 408],
  managePrimary: [1268, 554],
  manageSecondary: [1268, 657],
  crumb: [690, 55],
  soundPill: [1224, 184],
  sound: (i: number) => [1130, 262 + i * 33],
  toggle: [1259, 260],
  move: [1155, 477],
} as const;

const SOUNDS = ["Chime", "Arpeggio", "Breaking", "Canopy", "Daybreak"];
const QUIET_SOUNDS = ["Pebble", "Breeze", "Hush", "Ripple", "Whisper"];

const SCRIPT = script<S>(({ at, move, click }) => {
  // 1. Notifications: delivery, from Email only to Email + Push.
  move(1100, AT.deliveryPill, [905, 300, 1.6]);
  click(1000, (s) => ({ ...s, deliveryOpen: true }));
  move(650, AT.emailPush);
  click(800, (s) => ({ ...s, delivery: "Email + Push", deliveryOpen: false }));
  // 2. Manage the primary emails.
  move(900, AT.managePrimary, [905, 605, 1.45]);
  click(1000, (s) => ({ ...s, page: "primary", cam: [895, 228, 1.6] }));
  // 3. A louder sound for what matters: listen, pick Canopy.
  move(1000, AT.soundPill);
  click(800, (s) => ({ ...s, soundOpen: true, cam: [960, 322, 1.6] }));
  move(550, AT.sound(1));
  at(80, (s) => ({ ...s, hover: 1 }));
  move(900, AT.sound(3));
  at(80, (s) => ({ ...s, hover: 3 }));
  click(800, (s) => ({ ...s, sound: "Canopy", soundOpen: false, hover: null, cam: [895, 228, 1.6] }));
  // 4. Replies keep the same urgency.
  move(650, AT.toggle);
  click(750, (s) => ({ ...s, thread: true }));
  // 5. A newsletter that isn't urgent goes to Secondary.
  move(900, AT.move, [890, 532, 1.45]);
  click(900, (s) => ({ ...s, moved: true, toast: true }));
  at(1500, (s) => ({ ...s, cam: WIDE }));
  // 6. Back, and into Secondary emails: quieter sounds, and the email that moved.
  move(1000, AT.crumb, [740, 110, 1.8]);
  at(250, (s) => ({ ...s, toast: false }));
  click(800, (s) => ({ ...s, page: "notif", cam: [905, 610, 1.45] }));
  move(900, AT.manageSecondary);
  click(800, (s) => ({ ...s, page: "secondary", cam: [960, 420, 1.3] }));
  at(2400, (s) => ({ ...s, cam: WIDE }));
  at(1600, (s) => ({ ...s, fade: true }));
});


const Icon = ({ icon, size = 18, color = "currentColor", w = 1.5 }: { icon: IconSvgElement; size?: number; color?: string; w?: number }) => (
  <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={w} />
);

const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ left: x, top: y, width: w, height: h });

export default function ExomailFlow({ active, label }: { active: boolean; label: string }) {
  const s = useRecording(active, START, SCRIPT);
  const secondary = s.page === "secondary";

  return (
    <Recording w={W} h={H} s={s} label={label} className="ex">
          <div className="ex-art">
            {/* ------------------------------------------------ Sidebar */}
            <aside className="ex-side">
              <b className="ex-logo">EXOMAIL</b>
              <span className="ex-btn-new">New mail</span>
              <ul className="ex-nav">
                {[
                  [InboxIcon, "Inbox"],
                  [SentIcon, "Sent"],
                  [StarIcon, "Starred"],
                  [NoteEditIcon, "Draft"],
                  [Flag02Icon, "Flagged"],
                  [Delete02Icon, "Bin"],
                ].map(([icon, name], i) => (
                  <li key={name as string} style={{ top: 162 + i * 41 }}>
                    <Icon icon={icon as IconSvgElement} />
                    {name as string}
                  </li>
                ))}
                <li className="is-on" style={{ top: 404 }}>
                  <Icon icon={Settings02Icon} />
                  Settings
                </li>
              </ul>
            </aside>
            <aside className="ex-side2">
              <b className="ex-side2-h">Settings</b>
              <ul className="ex-nav ex-nav--sub">
                {[
                  [Settings02Icon, "General"],
                  [Notification01Icon, "Notifications"],
                  [UserIcon, "My accounts"],
                  [SquareLock02Icon, "Security"],
                  [PaintBoardIcon, "Appearance"],
                ].map(([icon, name], i) => (
                  <li key={name as string} className={i === 1 ? "is-on" : undefined} style={{ top: 92 + i * 41 }}>
                    <Icon icon={icon as IconSvgElement} />
                    {name as string}
                  </li>
                ))}
              </ul>
            </aside>

            {/* ------------------------------------------------ Notifications */}
            <section className="ex-page" data-on={s.page === "notif"}>
              <h4 className="ex-abs ex-h1" style={box(482, 37)}>
                Notifications
              </h4>
              <p className="ex-abs ex-sub" style={box(482, 76)}>
                Manage how you receive email notifications
              </p>
              <span className="ex-abs ex-label" style={box(482, 133)}>
                General
              </span>
              <div className="ex-abs ex-card" style={box(482, 166, 845, 259)}>
                <Row y={21} title="Enable notifications" sub="Receive notifications for new emails" />
                <span className="ex-toggle is-on" style={box(777, 33)}>
                  <i />
                </span>
                <Row y={105} title="Notification delivery" sub="Email only, Push only, Email + Push" />
                <span className="ex-pill" style={box(712, 113, 109)}>
                  <span key={s.delivery} className="ex-pill-v">
                    {s.delivery}
                  </span>
                  <i />
                  <Icon icon={ArrowDown01Icon} size={14} />
                </span>
                <Row y={189} title="Quiet hours" sub="Pause notifications during quiet hours" />
                <span className="ex-pill" style={box(643, 198, 178)}>
                  <span className="ex-pill-v">10:00 PM &nbsp;—&nbsp; 7:00 AM</span>
                  <i />
                  <Icon icon={ArrowDown01Icon} size={14} />
                </span>
              </div>
              {/* The delivery menu (drawn to match the sound list). */}
              <div className="ex-abs ex-menu" data-on={s.deliveryOpen} style={box(1103, 318, 200)}>
                {["Email only", "Push only", "Email + Push"].map((d) => (
                  <span key={d} className={`ex-menu-i${s.delivery === d ? " is-sel" : ""}`}>
                    {d}
                    {s.delivery === d ? <Icon icon={Tick02Icon} size={16} color="#7a5cc0" w={2} /> : null}
                  </span>
                ))}
              </div>
              <span className="ex-abs ex-label ex-label--i" style={box(482, 467)}>
                Notification category
                <Icon icon={InformationCircleIcon} size={15} />
              </span>
              <div className="ex-abs ex-card" style={box(482, 499, 845, 214)}>
                <Row y={21} title="Primary emails" sub={"Important emails from individuals or organizations you interact\nwith frequently."} />
                <span className="ex-manage" style={box(751, 42)}>
                  Manage
                </span>
                <Row y={124} title="Secondary emails" sub={"All other messages like newsletters, promotions, and updates.\nYou’ll still get them, just with a quieter notification."} />
                <span className="ex-manage" style={box(751, 145)}>
                  Manage
                </span>
              </div>
            </section>

            {/* ------------------------------------------------ Primary / Secondary */}
            {(["primary", "secondary"] as const).map((pg) => {
              const isSec = pg === "secondary";
              const name = isSec ? "Secondary" : "Primary";
              const rows = isSec ? SECONDARY_ROWS : PRIMARY_ROWS;
              return (
                <section key={pg} className="ex-page" data-on={s.page === pg}>
                  <span className="ex-abs ex-crumbs" style={box(484, 46)}>
                    <span>Notification</span>
                    <Icon icon={ArrowRightDoubleIcon} size={14} />
                    <span>Notification category</span>
                    <Icon icon={ArrowRightDoubleIcon} size={14} color="#3d2c59" />
                    <b>{name} emails</b>
                  </span>
                  <h4 className="ex-abs ex-h2" style={box(482, 100)}>
                    {name} notification
                  </h4>
                  <div className="ex-abs ex-card" style={box(482, 139, 821, 166)}>
                    <Row y={21} title="Notification sound" sub={isSec ? "Quiet alert" : "Loud alert"} />
                    <span className="ex-pill ex-pill--sound" style={box(686, 29, 112)}>
                      <span className="ex-speaker">
                        <Icon icon={VolumeHighIcon} size={13} />
                      </span>
                      <span key={isSec ? "q" : s.sound} className="ex-pill-v">
                        {isSec ? "Pebble" : s.sound}
                      </span>
                      <i />
                      <Icon icon={ArrowDown01Icon} size={14} />
                    </span>
                    <Row y={97} title="Thread handling" sub="Treat replies with same urgency as original email" />
                    <span className={`ex-toggle${!isSec && s.thread ? " is-on" : ""}`} style={box(753, 109)}>
                      <i />
                    </span>
                  </div>
                  {!isSec && (
                    <div className="ex-abs ex-menu ex-menu--sound" data-on={s.soundOpen} style={box(1063, 202, 240)}>
                      <span className="ex-menu-h">Select sound</span>
                      {SOUNDS.map((nm, i) => (
                        <span key={nm} className={`ex-menu-i${s.sound === nm ? " is-sel" : ""}${s.hover === i ? " is-hover" : ""}`}>
                          {nm}
                          {i === 0 ? " (Default)" : ""}
                          {s.hover === i ? (
                            <span className="ex-playing" aria-hidden="true">
                              <i />
                              <i />
                              <i />
                            </span>
                          ) : s.sound === nm ? (
                            <Icon icon={Tick02Icon} size={16} color="#7a5cc0" w={2} />
                          ) : null}
                        </span>
                      ))}
                      <span className="ex-menu-note">Sounds in this list are tuned for clarity and urgency, helping you catch important messages right away.</span>
                    </div>
                  )}
                  <i className="ex-abs ex-rule" style={box(482, 337, 821)} />
                  <h4 className="ex-abs ex-h2" style={box(482, 378)}>
                    Emails in this category
                  </h4>
                  <span className="ex-abs ex-count" style={box(670, 377)}>
                    {isSec ? "1,285" : s.moved ? "299" : "300"}
                  </span>
                  <span className="ex-abs ex-search" style={box(765, 370, 507, 40)}>
                    <Icon icon={Search01Icon} size={16} />
                    Search email...
                  </span>
                  <ul className="ex-abs ex-list" style={box(482, 434, 790)}>
                    {rows.map((r, i) => (
                      <li key={r.email + i} className={!isSec && i === 0 && s.moved ? "is-gone" : isSec && i === 0 ? "is-new" : undefined}>
                        <i className="ex-check" />
                        <span className="ex-name">{r.name}</span>
                        <span className="ex-email">{r.email}</span>
                        <span className="ex-move">Move to {isSec ? "primary" : "secondary"}</span>
                        <span className="ex-kebab">
                          <Icon icon={MoreVerticalIcon} size={18} color="#3d2c59" />
                        </span>
                      </li>
                    ))}
                  </ul>
                  <span className="ex-abs ex-scroll" style={box(1296, 434, 7, 484)}>
                    <i />
                  </span>
                </section>
              );
            })}

            {/* Moved: a quiet note with Undo. */}
            <div className="ex-toast" data-on={s.toast && !secondary}>
              Alex Makinde moved to Secondary emails
              <b>Undo</b>
            </div>

          </div>
    </Recording>
  );
}

function Row({ y, title, sub }: { y: number; title: string; sub: string }) {
  return (
    <span className="ex-row" style={{ top: y }}>
      <b>{title}</b>
      <span>
        {sub.split("\n").map((line, i) => (
          <span key={i} className="ex-line">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}

const PRIMARY_ROWS = Array.from({ length: 7 }, () => ({ name: "Alex Makinde", email: "Alexmakin01@gmail.com" }));
const SECONDARY_ROWS = [
  { name: "Alex Makinde", email: "Alexmakin01@gmail.com" },
  { name: "Medium Daily Digest", email: "noreply@medium.com" },
  { name: "Figma", email: "announcements@figma.com" },
  { name: "Spotify", email: "no-reply@spotify.com" },
  { name: "Substack", email: "hello@substack.com" },
  { name: "Uber Eats", email: "uber@uber.com" },
];
