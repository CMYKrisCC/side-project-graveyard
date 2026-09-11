# Rage Click

NERDCONF "Fun Build" track submission — Burning Token hackathon.

## The idea

A face on screen. You tap it. It gets angrier — screen shake, color shift, cracks
spreading across the screen, angrier sound with every hit — until it hits its
limit and surrenders. No login, no explanation needed: someone opens the page
and immediately knows what to do.

## Judging criteria → what this build does

- **Shipping** — static site, zero build step, zero dependencies to install.
  Opens directly in any browser.
- **Originality** — inverts the usual "clicker game" reward loop: escalation
  instead of a score going up.
- **Fun** — the one interaction (tap the face) is legible in one second and
  gets more absurd the longer you push it.
- **Execution** — synthesized audio (Web Audio, no asset files to go missing),
  shake/color/crack feedback all tied to the same rage value so timing stays
  consistent.

## Running it

No install required.

```
# from this folder
python -m http.server 8000
```

Then open http://localhost:8000. (Opening `index.html` directly also works in
most browsers, but a local server avoids any module-loading quirks in Safari.)

## Structure

```
index.html            entry point
styles/main.css        all visual styling + the tier-based face states
src/main.js             game loop: rage state, taunts, click handling
src/effects.js          screen shake, hue/contrast, crack overlay
src/audio.js            synthesized thud + break sound (Web Audio, no files)
reference_image/        drop reference art/screenshots here if the look changes
docs/                    concept notes, demo script, submission checklist
```

## Hackathon info

- Dashboard: https://app.burningtoken.dev/dashboard
- Deadline: September 12 · 11:59 PM PDT
