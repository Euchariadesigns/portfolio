"use client";

import type { CSSProperties, ReactNode } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  ArrowDataTransferVerticalIcon,
  ArrowExpand01Icon,
  ArrowLeft01Icon,
  ArrowLeftToLineIcon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowUp01Icon,
  Cancel01Icon,
  ChartColumnIcon,
  DashboardSquare02Icon,
  InformationCircleIcon,
  LeftToRightListBulletIcon,
  Location01Icon,
  MoreVerticalIcon,
  Notification01Icon,
  PlusSignIcon,
  RssIcon,
  Search01Icon,
  SidebarLeftIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Recording, script, useRecording } from "./recording";
import type { Base, Cam } from "./recording";
import "./avelis.css";

/*
  Avelis Health (an exploration): reviewing a flagged healthcare claim and
  following its dispute, playing by itself like a Screen Studio recording.

  Built from Eucharia's Figma screens (1440 x 1024): the flagged claims
  table, the claim opening in a side panel (the table narrows to make room),
  and the negotiation status. The cursor opens a claim, reads why it was
  flagged, checks the dispute, then closes the panel.
*/

const W = 1440;
const H = 1024;
const WIDE: Cam = [W / 2, H / 2, 1];

type S = Base & {
  hover: number | null;
  sel: number | null;
  open: boolean;
  modal: boolean;
};

const START: S = {
  hover: null,
  sel: null,
  open: false,
  modal: false,
  cursor: [720, 640],
  click: 0,
  cam: WIDE,
  fade: false,
  still: false,
};

// Where things are, in the Figma frame's points.
const AT = {
  row: [600, 352],
  view: [1343, 352],
  overcharge: [1150, 212],
  analysis: [1260, 640],
  negotiation: [1324, 973],
  dispute: [760, 560],
  okay: [720, 728],
  collapse: [904, 97],
} as const;

const SCRIPT = script<S>(({ at, move, click }) => {
  // 1. The flagged claims: find one and open it.
  move(1100, AT.row, [800, 380, 1.3]);
  at(80, (s) => ({ ...s, hover: 0 }));
  move(900, AT.view, [1040, 360, 1.5]);
  click(800, (s) => ({ ...s, open: true, sel: 0, hover: null, cam: [1150, 300, 1.6] }));
  // 2. Why it was flagged: the overcharge, then the contract rate it broke.
  move(1300, AT.overcharge);
  move(1700, AT.analysis, [1150, 650, 1.6]);
  // 3. Where the dispute stands.
  move(1900, AT.negotiation, [1150, 830, 1.55]);
  click(800, (s) => ({ ...s, modal: true, cam: [720, 512, 1.55] }));
  move(1300, AT.dispute);
  move(1500, AT.okay);
  click(700, (s) => ({ ...s, modal: false, cam: [1100, 420, 1.25] }));
  // 4. Done: close the panel; the table opens back up.
  move(1100, AT.collapse, [900, 200, 1.6]);
  click(800, (s) => ({ ...s, open: false, sel: null, cam: WIDE }));
  at(2400, (s) => ({ ...s, fade: true }));
});

type Claim = { id: string; patient: string; short: string; provider: string; error: "over" | "dup" | "code" };

const CLAIMS: Claim[] = [
  { id: "CLM23-4R", patient: "Sarah Martins", short: "Sarah M.", provider: "Memorial Hospital", error: "over" },
  { id: "CLM23-7K", patient: "Anderson Patrick", short: "Anderson P.", provider: "Sunnydale Medical", error: "dup" },
  { id: "CLM23-2M", patient: "Lisa Jude", short: "Lisa J.", provider: "Riverside Gen Hospital", error: "code" },
  { id: "CLM23-9P", patient: "Michael Williams", short: "Michael W.", provider: "View Health Center", error: "over" },
  { id: "CLM23-5T", patient: "Hannah Jonah", short: "Hannah J.", provider: "Lakeside Hospital", error: "code" },
  { id: "CLM23-3B", patient: "Wilson James", short: "Wilson J.", provider: "Oakwood Hospital", error: "over" },
  { id: "CLM23-8D", patient: "Jordan Mick", short: "Jordan M.", provider: "Starlight Hospital", error: "dup" },
  { id: "CLM23-6F", patient: "Jordan Mick", short: "Jordan M.", provider: "Starlight Hospital", error: "over" },
];

const ERROR = {
  over: ["Overcharge", "O.charge"],
  dup: ["Duplicate Charge", "D.Charge"],
  code: ["Coding error", "C.Error"],
} as const;

const Icon = ({ icon, size = 18, color = "currentColor", w = 1.5 }: { icon: IconSvgElement; size?: number; color?: string; w?: number }) => (
  <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={w} />
);

const box = (x: number, y: number, w?: number, h?: number): CSSProperties => ({ left: x, top: y, width: w, height: h });

/** The full text, or the short one once the panel is open. */
function Swap({ full, short }: { full: ReactNode; short: ReactNode }) {
  return (
    <span className="avh-swap">
      <span className="avh-full">{full}</span>
      <span className="avh-short">{short}</span>
    </span>
  );
}

// A column's left edge, with the table full width and with the panel open.
const col = (full: number, open: number) => ({ "--x": `${full}px`, "--xo": `${open}px` }) as CSSProperties;

const NAV: [string, IconSvgElement, string][][] = [
  [
    ["Claims", RssIcon, "Flagged"],
    ["", DashboardSquare02Icon, "Resolved"],
    ["", LeftToRightListBulletIcon, "Clean"],
  ],
  [
    ["Analytics", LeftToRightListBulletIcon, "Savings dashboard"],
    ["", Location01Icon, "Insights"],
    ["", ChartColumnIcon, "Report"],
  ],
  [
    ["Contracts", PlusSignIcon, "Provider Contracts"],
    ["", LeftToRightListBulletIcon, "Contract Violations"],
  ],
  [
    ["Settings", Location01Icon, "Integration"],
    ["", LeftToRightListBulletIcon, "Team & Permissions"],
    ["", ChartColumnIcon, "Billing"],
    ["", ChartColumnIcon, "Notifications"],
  ],
];
const GROUP_Y = [162, 358, 529, 667];
const ITEM_Y = [
  [200, 245, 286],
  [392, 425, 459],
  [562, 595],
  [701, 734, 768, 801],
];

export default function AvelisFlow({ active, label }: { active: boolean; label: string }) {
  const s = useRecording(active, START, SCRIPT);

  return (
    <Recording w={W} h={H} s={s} label={label} className="avh">
      <div className={`avh-art${s.open ? " is-open" : ""}`}>
        {/* ------------------------------------------------ Sidebar */}
        <aside className="avh-side">
          <img className="avh-logo" src="/explore/avelis-logo.png" alt="" width={64} height={31} />
          <span className="avh-abs avh-dim" style={box(228, 34)}>
            <Icon icon={SidebarLeftIcon} size={17} />
          </span>
          <span className="avh-item" style={{ top: 106 }}>
            <Icon icon={DashboardSquare02Icon} size={16} />
            Overview
          </span>
          {NAV.map((group, g) => (
            <div key={g}>
              <span className="avh-group" style={{ top: GROUP_Y[g] }}>
                {group[0][0]}
                <Icon icon={ArrowUp01Icon} size={13} />
              </span>
              {group.map(([, icon, name], i) =>
                name === "Flagged" ? (
                  <span key={name} className="avh-item avh-item--on" style={{ top: ITEM_Y[g][i] }}>
                    <Icon icon={icon} size={16} />
                    {name}
                    <b className="avh-badge">23</b>
                  </span>
                ) : (
                  <span key={name} className="avh-item" style={{ top: ITEM_Y[g][i] }}>
                    <Icon icon={icon} size={16} />
                    {name}
                  </span>
                ),
              )}
            </div>
          ))}
        </aside>

        {/* ------------------------------------------------ Header */}
        <header className="avh-top">
          <span className="avh-abs avh-title" style={box(292, 38)}>
            <span>All claims</span> — 127 flagged claims
          </span>
          <span className="avh-abs avh-search" style={box(930, 34)}>
            <Icon icon={Search01Icon} size={15} />
            Search
          </span>
          {[Notification01Icon, InformationCircleIcon, UserIcon].map((icon, i) => (
            <span key={i} className="avh-abs" style={box(1169 + i * 40, 34)}>
              <Icon icon={icon} size={18} color="#1e1a15" />
            </span>
          ))}
          <span className="avh-abs avh-btn-dark" style={box(1314, 27, 78, 33)}>
            Export
          </span>
        </header>

        {/* ------------------------------------------------ Stats */}
        <div className="avh-abs avh-card avh-stats" style={box(292, 91, undefined, 125)}>
          {(
            [
              ["Total flagged", "Total flagged", "127", "127", 91, 63],
              ["Potential savings", "P. savings", "$284,480", "$284...", 397, 210],
              ["Avg. per claim", "Avg. per claim", "$2,240", "$2,2..", 707, 357],
              ["Confidence level", "Confidence L", "89%", "89%", 997, 504],
            ] as const
          ).map(([l, ls, v, vs, x, xo]) => (
            <span key={l} className="avh-stat avh-col" style={col(x, xo)}>
              <span className="avh-stat-l">
                <Swap full={l} short={ls} />
              </span>
              <b className="avh-stat-v">
                <Swap full={v} short={vs} />
              </b>
            </span>
          ))}
          {(
            [
              [229, 136],
              [565, 285],
              [848, 434],
            ] as const
          ).map(([x, xo]) => (
            <i key={x} className="avh-stat-rule avh-col" style={col(x, xo)} />
          ))}
        </div>

        {/* ------------------------------------------------ Table */}
        <div className="avh-abs avh-card avh-table" style={box(292, 256, undefined, 692)}>
          <div className="avh-thead">
            <i className="avh-check avh-col" style={col(20, 20)} />
            {(
              [
                ["Claim ID", "CLM ID", 58, 58],
                ["Patient", "Patient", 218, 154],
                ["Provider", "Provider", 370, 264],
                ["Service date", "Date", 562, 394],
                ["Error type", "Error", 733, 482],
                ["Amount at risk", "", 887, 887],
              ] as const
            ).map(([l, ls, x, xo]) => (
              <span key={l} className={`avh-th avh-col${ls ? "" : " avh-gone"}`} style={col(x, xo)}>
                <Swap full={l} short={ls} />
                <Icon icon={ArrowDataTransferVerticalIcon} size={13} color="#a59e99" />
              </span>
            ))}
            <span className="avh-col avh-gone avh-kebab" style={col(1060, 1060)}>
              <Icon icon={MoreVerticalIcon} size={18} color="#1e1a15" />
            </span>
          </div>
          {CLAIMS.map((c, i) => (
            <div key={c.id} className={`avh-row${s.hover === i ? " is-hover" : ""}${s.sel === i ? " is-sel" : ""}`} style={{ top: 54 + i * 80 }}>
              <i className="avh-check avh-col" style={col(20, 20)} />
              <span className="avh-td avh-col" style={col(58, 58)}>
                <Swap full={c.id} short={c.id.slice(5)} />
              </span>
              <span className="avh-td avh-col" style={col(218, 154)}>
                <Swap full={c.patient} short={c.short} />
              </span>
              <span className="avh-td avh-col" style={col(370, 264)}>
                <Swap full={c.provider} short={`${c.provider.split(" ")[0]}...`} />
              </span>
              <span className="avh-td avh-col" style={col(570, 394)}>
                <Swap full="Oct 14, 2024" short="Oct 14..." />
              </span>
              <span className={`avh-td avh-col avh-chip avh-chip--${c.error}`} style={col(731, 481)}>
                <Swap full={ERROR[c.error][0]} short={ERROR[c.error][1]} />
              </span>
              <span className="avh-td avh-col avh-gone" style={col(909, 909)}>
                $2,400
              </span>
              <span className="avh-col avh-gone avh-view" style={col(1020, 1020)}>
                View
              </span>
            </div>
          ))}
        </div>
        <span className="avh-abs avh-showing" style={box(312, 966)}>
          Showing items 1 - 8 of 127
        </span>
        <span className="avh-pager avh-col" style={col(1288, 758)}>
          <Icon icon={ArrowLeft01Icon} size={15} color="#a59e99" />
          <b>1</b>
          <Icon icon={ArrowRight01Icon} size={15} color="#a59e99" />
        </span>

        {/* ------------------------------------------------ The claim */}
        <aside className="avh-panel" aria-hidden={!s.open}>
          <span className="avh-abs avh-dim" style={box(20, 19)}>
            <Icon icon={ArrowLeftToLineIcon} size={18} />
          </span>
          <b className="avh-abs avh-claim-id" style={box(56, 18)}>
            #CLM23-4R
          </b>
          <span className="avh-abs avh-dim" style={box(502, 20)}>
            <Icon icon={ArrowExpand01Icon} size={17} />
          </span>
          <i className="avh-abs avh-rule" style={box(0, 51, 566)} />

          <div className="avh-abs avh-over" style={box(17, 71, 515, 140)}>
            <span>Overcharge Detected</span>
            <b>$2,400</b>
            <em>97% confidence level</em>
          </div>

          <span className="avh-abs avh-sec" style={box(17, 233)}>
            Claim Details
          </span>
          <div className="avh-abs avh-dcard avh-details" style={box(17, 260, 506, 183)}>
            {(
              [
                ["Patient", "Sarah Martins"],
                ["Provider", "Memorial Hospital Network"],
                ["Service date", "October 14, 2024"],
                ["Claim submitted", "October 22, 2024"],
                ["Procedure", "MRI - Brain without contrast"],
                ["CPT code", "70551"],
              ] as const
            ).map(([l, v]) => (
              <span key={l}>
                <small>{l}</small>
                {v}
              </span>
            ))}
          </div>

          <span className="avh-abs avh-sec" style={box(17, 465)}>
            Problem Analysis
          </span>
          <div className="avh-abs avh-dcard" style={box(17, 492, 506, 189)}>
            <span className="avh-abs avh-money" style={box(23, 18)}>
              <small>Amount Billed</small>
              <b>$5,400</b>
            </span>
            <span className="avh-abs" style={box(237, 36)}>
              <Icon icon={ArrowRight02Icon} size={20} color="#6d665f" />
            </span>
            <span className="avh-abs avh-money avh-money--r" style={{ top: 18, right: 28 }}>
              <small>Contracted Rate</small>
              <b>$3,000</b>
            </span>
            <div className="avh-abs avh-why" style={box(23, 99, 460)}>
              <span>
                Error Type: <i>Incorrect Contract Rate Applied</i>
              </span>
              <p>
                Memorial Hospital billed at their standard rate instead of your negotiated contract rate. Your agreement (Contract #MHN-2023-A, Section 4.2) specifies a fixed rate of $3,000 for CPT 70551.
              </p>
            </div>
          </div>

          <span className="avh-abs avh-sec" style={box(17, 704)}>
            Supporting Evidence
          </span>
          <div className="avh-abs avh-dcard avh-evidence" style={box(17, 731, 506, 170)}>
            <b>Contract Reference</b>
            <p>Section 4.2: &ldquo;Diagnostic imaging - MRI Brain (CPT 70551) - Fixed rate: $3,000.00&rdquo;</p>
            <b>Historical Claims Data</b>
            <p className="avh-small">Your organization has processed 47 similar MRI claims from Memorial Hospital in the past 12 months, all correctly billed at $3,000.00</p>
          </div>

          <div className="avh-abs avh-foot" style={box(0, 872, 566, 84)}>
            <p>
              In negotiation, Avelis is handling the dispute
              <br />
              with the provider.
            </p>
            <span className="avh-btn-dark avh-btn-neg">see negotiation status</span>
          </div>
        </aside>

        {/* ------------------------------------------------ Negotiation status */}
        <div className="avh-shade" data-on={s.modal} />
        <div className="avh-modal" data-on={s.modal}>
          <b className="avh-modal-t">Negotiation status</b>
          <span className="avh-abs" style={box(541, 20)}>
            <Icon icon={Cancel01Icon} size={20} color="#1e1a15" />
          </span>
          <i className="avh-abs avh-rule" style={box(36, 56, 528)} />
          <div className="avh-abs avh-note" style={box(39, 80, 509)}>
            <b>Please note</b>
            <p>These claims have been flagged for potential overcharges. Avelis is actively reviewing and negotiating with the provider to resolve the issue and recover any overpayments.</p>
          </div>
          <div className="avh-abs avh-dispute" style={box(40, 205, 519, 200)}>
            <b>Dispute Summary</b>
            {(
              [
                ["Claim ID", "CLM23-4R"],
                ["Provider", "Memorial Hospital Network"],
                ["Error Type", "Incorrect Contract Rate"],
                ["Disputed Amount", "$2,400"],
              ] as const
            ).map(([l, v]) => (
              <span key={l}>
                {l}
                <em>{v}</em>
              </span>
            ))}
          </div>
          <i className="avh-abs avh-rule" style={box(0, 438, 600)} />
          <span className="avh-abs avh-okay" style={box(240, 457, 120, 37)}>
            Okay
          </span>
        </div>
      </div>
    </Recording>
  );
}
