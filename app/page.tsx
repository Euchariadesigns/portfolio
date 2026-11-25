import PageFade from "@/components/PageFade";
import { InstagramLogo, TiktokLogo } from "@phosphor-icons/react/dist/ssr";
import Peek from "@/components/Peek";
import SayHi from "@/components/SayHi";
import SiteFooter from "@/components/SiteFooter";
import SubstackMark from "@/components/SubstackMark";
import Soon from "@/components/Soon";
import Stamp from "@/components/Stamp";
import SiteNav from "@/components/SiteNav";
import WorkStack from "@/components/WorkStack";

export default function Home() {
  return (
    <PageFade>
      <div className="page">
        <SiteNav reveal />

        <main>
          {/* After Bimanshu's page (picture above the name, "Hi, I'm" with the name in Caveat, highlighted
              words with small previews, inline links) and Shater's (the greeting, small text sizes). */}
          <section className="hero hero3" aria-labelledby="hero-title">
            <div className="hero3-col">
              <div className="reveal" style={{ "--r": 1 } as React.CSSProperties}>
                <Stamp />
                <h1 id="hero-title" className="hero-hi">
                  Hi, I&rsquo;m <em>Eucharia</em>.
                </h1>
              </div>
              <div className="reveal" style={{ "--r": 2 } as React.CSSProperties}>
                <p className="hero-p">
                  Product Designer who ships the code. I specialize in 0&rarr;1 products. I take products from
                  research to design, and then build them in Claude Code, Lovable and Codex. Most recently I owned design at Verified Graduate Tutors. Before that I designed AI-assisted invoice
                  classification at Keepbook, and virtual cards, cross-border payments and{" "}
                  <Peek
                    href="/work/goal-savings"
                    icon="/work/goal-savings/e1.png"
                    tone="#2f7a3b"
                    preview={<img className="pk-img" src="/peek/goal.webp" alt="" width={360} height={278} />}
                  >
                    Goal Savings
                  </Peek>{" "}
                  at Ejara.
                </p>
                <p className="hero-p">
                  Lately I&rsquo;ve been building{" "}
                  <Peek
                    href="https://trymargin.expo.app/"
                    icon="/work/margin/icon.png"
                    tone="#0a6fe0"
                    preview={<img className="pk-img pk-img--paper" src="/peek/margin.webp" alt="" width={375} height={168} />}
                  >
                    Margin
                  </Peek>
                  , an app that helps you get back the habit of thinking through things. I also built{" "}
                  <Peek
                    href="https://stratajournal.com/"
                    tone="#6b2a44"
                    preview={<img className="pk-img" src="/peek/strata.webp" alt="" width={440} height={298} />}
                  >
                    Strata
                  </Peek>
                  , a physical journal that keeps every thought on a thread. I write on{" "}
                  <a className="hl" href="https://substack.com/@ukheriah" target="_blank" rel="noreferrer">
                    Substack
                    <SubstackMark />
                  </a>{" "}
                  about what I believe, what I&rsquo;ve observed and how I think life should be, and I talk about design,
                  humans and life in general on{" "}
                  <a className="hl" href="https://www.instagram.com/ukheriah_" target="_blank" rel="noreferrer">
                    Instagram
                    <InstagramLogo weight="regular" aria-hidden="true" />
                  </a>
                  ,{" "}
                  <a className="hl" href="https://x.com/Euchariadesigns" target="_blank" rel="noreferrer">
                    X
                  </a>{" "}
                  and{" "}
                  <a className="hl" href="https://www.tiktok.com/@ukheriah" target="_blank" rel="noreferrer">
                    TikTok
                    <TiktokLogo weight="regular" aria-hidden="true" />
                  </a>
                  . When I&rsquo;m not designing, I&rsquo;m reading, yapping or watching K-drama. Here&rsquo;s{" "}
                  <Soon className="soon--chip">
                    what I&rsquo;m reading
                  </Soon>{" "}
                  and{" "}
                  <Soon className="soon--chip">
                    watching now
                  </Soon>
                  .
                </p>
                <p className="hero-open">
                  <span className="hero-dot" aria-hidden="true" />
                  Open to product design roles.{" "}
                  <SayHi className="say-hi">Say hi</SayHi>
                </p>
              </div>
            </div>
          </section>

          <section id="work" className="work reveal" style={{ "--r": 3 } as React.CSSProperties} aria-label="Work">
            <WorkStack />
          </section>
        </main>

        <SiteFooter />
      </div>
    </PageFade>
  );
}
