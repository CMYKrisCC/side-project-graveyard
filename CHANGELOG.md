# Changelog — Side Project Graveyard

Burning Token 2026 · Fun Build (NERDCONF) + Multiplayer (Convex)

## Prior work

**Nothing in this repository existed before September 5, 2026.** The repo was
created during the event and every commit here is event work. No existing
product, template, or prototype was carried in.

Tools used to build it: Claude Code (Opus 5) for pair programming, Vite, React
Three Fiber, and Convex. Third-party assets are credited in the Credits section
below as they are added.

---

## 2026-09-05 — Repo created · first prototype, abandoned

- Started the repo for the Fun Build track.
- Built "Rage Click," a click-to-enrage browser toy (vanilla HTML/CSS/JS, Web
  Audio synthesis, no dependencies).
- **Abandoned.** The clicker / useless-button format is heavily saturated and
  scored poorly against the Originality criterion. Kept for the record in
  `archive/rage-click/`. It is not part of the submission.

## 2026-09-09 — Research · concept change

- Pulled the official rules and all six track briefs from the Burning Token MCP
  and saved them to `docs/hackathon/`.
- Decided to enter **one project into two challenges**: Fun Build and
  Multiplayer, since the submission form accepts multiple challenges.
- New concept: **Side Project Graveyard** — bury a side project you abandoned,
  get a headstone in a shared 3D cemetery, and watch other people wander it live.

## 2026-09-10 — Stack · first deploy

- Scaffolded React 19.2, Vite 8, React Three Fiber 9, drei 10, postprocessing 3,
  three 0.186.
- Added Convex 1.45 and `@convex-dev/static-hosting` 0.2.1, configured so the
  static site owns the root URL and app HTTP endpoints live under `/api`.
- Linked the repo to the Convex project `side-project-graveyard`.
- First deploy live on Convex Static Hosting: https://bold-puffin-442.convex.site
  (minimal night scene — fog, ground plane, one placeholder headstone).

## 2026-09-11 — Art direction · baseline commit

- Art direction locked: **moonlit low-poly** — blue-violet fog, warm lantern
  glow, low-poly props.
- Baseline commit recorded for judging.
- Production deploy live: https://successful-ermine-668.convex.site
- Added the Kenney Graveyard Kit (CC0) to `public/models/`.
- **Convex backend built and verified.** Tables for graves, flower events, and
  visitors. `graves.bury` allocates the next plot inside the mutation
  transaction, so simultaneous burials cannot collide. `graves.leaveFlower` is
  deduplicated per visitor. `visitors.move` records one destination event per
  click rather than streaming positions. A cron sweeps stale visitors every
  5 minutes. Server-side validation covers name and epitaph length, a cause-of-
  death allowlist, a leetspeak-aware word filter, a burial limit per visitor,
  and report-to-hide.
- Graveyard renders from the live query; verified in two isolated browser
  sessions that a burial in one appears in the other with no refresh.
- **Design pass on the inscription and burial flow** (direction by Kris):
  headstones now carry a randomised memorial line, the project name in Cinzel,
  and the cause and dates in Manrope. Inscriptions billboard toward the camera
  and only render within reading distance; plot spacing was widened so
  neighbouring inscriptions cannot collide. Burial form rebuilt with the
  cause-of-death list grouped into six categories, and hovering a grave now
  reveals its epitaph.

---

## 2026-09-12 — Music, larger cause list

- Replaced the synthesised wind ambience with a licensed background track.
  The bell and flower chime are still synthesised.
- Cause-of-death list is roughly twice as tall and measures the space
  available, flipping above the field when there isn't room below.
- Loading screen: a ghost drifts along a candlelit progress bar while the
  models download. It is plain HTML in `index.html`, so it paints before the
  JavaScript bundle arrives, then tracks real asset progress and stays up
  until the graveyard has actually rendered. Verified on a throttled Slow 3G
  production build.

---

## Credits

- Burning Token MCP — official rules, track briefs, and status.
- **Kenney Graveyard Kit 5.0** (www.kenney.nl) — CC0 / public domain. 91 low-poly
  GLB models used for headstones, crypts, fencing, lanterns, trees, and the
  ghost visitor avatar. License file kept at
  `public/models/kenney-graveyard/License.txt`.
- **Cinzel** (Bold) and **Manrope** (Regular, SemiBold) — SIL Open Font License
  1.1, via Google Fonts. Self-hosted in `public/fonts/` and used for both the
  3D headstone inscriptions and the interface.
- **"Spirits of the Moor" by Geoff Harvey**, from Pixabay
  (https://pixabay.com/users/geoffharvey-9096471/) under the Pixabay Content
  License. Used as the looping background score, credited in-app. The shipped
  copy in `public/music/` is re-encoded to 96 kbps to keep the download small.
  The original source file is kept locally and is not part of this repository,
  since the license does not permit redistributing it on its own.
