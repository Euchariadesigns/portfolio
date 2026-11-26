import type { Metadata, Viewport } from "next";
import { Alegreya, Caveat, Cormorant_Upright, Gentium_Book_Plus, Geist, Geist_Mono, Great_Vibes, IBM_Plex_Sans, Inter, Nunito, Source_Serif_4, STIX_Two_Text } from "next/font/google";
import Cursor from "@/components/Cursor";
import "./globals.css";
import "./visuals.css";
import "./covers.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
// The "Eucharia" wordmark in the nav.
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: ["400"], variable: "--font-logo", display: "swap" });
// Her name, in the serif Flo Guo uses for hers.
const stix = STIX_Two_Text({ subsets: ["latin"], weight: ["400", "500"], style: ["normal", "italic"], variable: "--font-name", display: "swap" });
// Case study section headings, as in the original case studies.
const alegreya = Alegreya({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-case-serif", display: "swap" });
// Case study callouts and "Thank you for reading", as in the original case studies.
const gentium = Gentium_Book_Plus({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-gentium",
  display: "swap",
});
// The /v3 homepage's type.
const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
// The three below are only used inside the Margin card, to match Margin's own type.
const cormorant = Cormorant_Upright({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-serif", display: "swap" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-rounded", display: "swap" });
const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-hand", display: "swap" });
// Homeland clinic exploration (its status ribbon). Not preloaded: only that page uses it.
const sourceSerif = Source_Serif_4({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-source-serif", display: "swap", preload: false });
// Tahseel exploration (its bank list). Not preloaded either.
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://euchariaodili.com"),
  title: "Eucharia Odili, product designer",
  description:
    "Product designer who ships the code. Eucharia takes 0→1 products from research to design, and builds them in Claude Code, Lovable and Codex.",
  openGraph: {
    title: "Eucharia Odili, product designer",
    description: "Product designer who ships the code. 0→1 products, from research to design to building.",
    images: ["/me/stamp.webp"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f5",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: page changes start at the top instantly instead of
    // smooth-scrolling up (the smooth scroll stays for in-page links).
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${greatVibes.variable} ${stix.variable} ${alegreya.variable} ${gentium.variable} ${geist.variable} ${geistMono.variable} ${cormorant.variable} ${nunito.variable} ${caveat.variable} ${sourceSerif.variable} ${plex.variable}`}>
      <body>
        {children}
        <Cursor />
      </body>
    </html>
  );
}
