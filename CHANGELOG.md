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

---

## Credits

- Burning Token MCP — official rules, track briefs, and status.
- Remaining third-party assets (3D kits, fonts, audio) will be listed here with
  their licenses as they are added.
