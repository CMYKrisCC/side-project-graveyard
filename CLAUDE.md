# Side Project Graveyard

A shared 3D cemetery for abandoned side projects. Bury one, get a headstone at a
real plot, walk around as a ghost with whoever else is online.

Built for Burning Token 2026, entered in two challenges at once: **Fun Build
(NERDCONF)** and **Multiplayer (Convex)**.

Stack: React 19 + Vite + React Three Fiber + drei + postprocessing, on Convex
(database, mutations, crons) with Convex Static Hosting.

## Commands

```
npm run dev                                  # local dev server
npx convex dev --once                        # push schema + functions to dev
npx @convex-dev/static-hosting upload --build  # deploy site to the DEV url
npm run deploy                               # deploy to PRODUCTION
npm run seed scripts/seed.json               # bulk-bury a list of projects
```

## Two deployments — the mistake to avoid

| | URL | Deployed by |
|---|---|---|
| dev | https://bold-puffin-442.convex.site | `upload --build` |
| **prod** | **https://successful-ermine-668.convex.site** | `npm run deploy` |

**Production is the URL on the submission form.** `npm run deploy` stops at a
yes/no prompt that only a human can answer, so an agent cannot deploy to
production — always ask the user to run it. Production silently ran a
days-old build for most of this project because every agent deploy went to dev.

**The two deployments have separate databases.** Deploying code to production
does not copy any data. `npm run seed` reads its target from `.env.local`, which
points at dev, so seeded graves land in dev only. To seed production, override
the target with the `.convex.cloud` URL (not `.convex.site`):

```
CONVEX_URL=https://successful-ermine-668.convex.cloud npm run seed scripts/seed.json
```

Check the target is empty first (`npx convex run --prod graves:list`) — session
ids in the seed are deterministic, so running it twice on one deployment
buries every project twice.

## Convex notes

- Schema changes need `npx convex dev --once` before the client will see them.
  New fields on existing tables must be `v.optional(...)`.
- **Queries cannot use wall-clock time reactively.** `Date.now()` inside a query
  is frozen until the data changes. Anything that expires — candle burn-down,
  stale visitors, emote timeouts — is computed on the client against a ticking
  `now` in state.
- Movement is stored as one destination event per click, never a position
  stream. Clients replay the same walk from the same timestamp. Keep it that way;
  per-frame writes would not survive a traffic spike on the free plan.
- Plot allocation reads the highest plot and inserts in the same mutation, so
  concurrent burials cannot collide. This is the Convex integration evidence —
  don't refactor it into a read-then-write across two calls.

## Verifying in the browser

Use chrome-devtools MCP. Two things that will waste your time otherwise:

- **Synthetic pointer events need `offsetX`/`offsetY` defined**, because React
  Three Fiber raycasts from those, not from `clientX`. Without them every click
  lands at the top-left corner and hits nothing.
- **Background tabs throttle timers and stop rendering.** Multiplayer tests fail
  misleadingly unless the receiving tab is foregrounded (`select_page` with
  `bringToFront`). Verify writes landed with `npx convex run visitors:list`
  before assuming the UI is broken.

Check the rendered result, not just that code ran — a speech bubble that renders
at 89px wide is "working" and unreadable.

## Scene decisions worth not re-litigating

- Inscriptions billboard toward the camera, so plot spacing (`src/layout.js`) is
  set by the width of the **text block**, not the headstone. Tightening it makes
  neighbouring graves overlap into mush.
- Inscriptions only render within reading distance. Every grave therefore needs
  its **marker light**, or from a distance headstones read as rocks.
- Each grave's inscription sits above that model's measured bounding box — stones
  vary in height and a fixed offset puts text inside the obelisk.
- The palette is graded cool and desaturated in postprocessing. Kenney's textures
  are built for daylight; grade globally rather than recolouring models.
- Dialogue and epitaph bubbles render at constant screen size. `distanceFactor`
  shrinks them into slivers.

## Recolouring Kenney models

Every model shares one palette texture, so a mesh cannot be recoloured through
its material, and editing `Textures/colormap.png` repaints the whole world.
`src/palette.js` instead moves UVs from one swatch to another, per model.

Swatch coordinates are `u = x / 512`, `v = y / 512` in that PNG, top-left
origin, no flip — so eyedropper a colour and divide its pixel position by 512.

Measure before assuming which part is which. The pine has three palette columns:
`u=0.219` is the trunk, `u=0.469` is the undersides of the canopy tiers, and
`u=0.719` holds every green. Guessing that "brown = trunk" cost three wrong
attempts; dumping vertex positions per column settled it in two minutes.

## Assets and licensing

The rules require attribution, and the changelog is the record judges read.
Anything added here goes in `CHANGELOG.md` under Credits.

- Kenney Graveyard Kit 5.0 — CC0. GLBs reference `Textures/colormap.png` by
  relative path; that folder must ship alongside them.
- Cinzel + Manrope — OFL, self-hosted in `public/fonts/`. Troika needs TTF or
  WOFF, not WOFF2.
- "Spirits of the Moor" by Geoff Harvey (Pixabay) — credited in-app. The 1.6MB
  encode in `public/music/` is what ships. The 4MB original lives in
  `assets-source/music/`, which is **git-ignored and must never be committed**:
  the repository is public, and Pixabay's license forbids redistributing the
  source file on its own. It was scrubbed from history before the first push.

Nothing loads from a CDN at runtime. Fonts, models, and audio are all
self-hosted so nothing can 404 while a judge is looking.

## Content

Graves are real submissions. Do not invent filler graves — fabricated content is
a disqualification risk under the rules, and the specific real ones are the funny
ones. Seed from a list the user supplies.
