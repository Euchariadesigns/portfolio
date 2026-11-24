# euchariaodili.com

The portfolio of Eucharia Odili, product designer. Live at **[euchariaodili.com](https://euchariaodili.com)**.

Designed and built by me with Claude Code: Next.js (App Router), React, TypeScript and plain CSS. Hosted on Vercel.

## What's inside

- **Home**: a short intro with highlighted words that preview the work on hover, and a pinned stack of work cards. Scroll or point at a card to open it; each opens onto an animated, looping visual of the product.
- **Work** (`/work`): every project as a gallery of tiles, each playing the product's flow.
- **Case studies** (`/work/<project>`): long reads with a section list that follows you as you scroll.
- **About** (`/about`).
- Small touches: a custom cursor, soft synthesised hover sounds (no audio files), a live Lagos clock.

## Run it locally

```bash
npm install
npm run dev      # http://localhost:3000
```

## Where things live

| What | Where |
| --- | --- |
| Home page and intro | `app/page.tsx` |
| Projects: order, colours, links | `lib/projects.ts` |
| The work stack on the home page | `components/WorkStack.tsx` |
| Visuals inside the open cards | `components/visuals/` |
| Work page tiles and their flows | `app/work/page.tsx`, `components/covers/` |
| Case study content | `lib/cases/*.json`, template in `app/work/[slug]/page.tsx` |
| About page | `app/about/` |
| Nav and footer | `components/SiteNav.tsx`, `components/SiteFooter.tsx` |
| Hover sounds | `lib/sound.ts` |
| Images and video | `public/` |

## Publish

Pushing to `main` deploys to [euchariaodili.com](https://euchariaodili.com) through Vercel.
