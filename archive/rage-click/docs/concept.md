# Concept — Rage Click

## One-line pitch

Tap a face until it can't take it anymore.

## Why this fits the track

The brief asks for a small idea with one great interaction, in the spirit of
SlapMac — playful, tactile, no explanation needed. Rage Click is a single
button that reacts believably: escalating shake, sound, color, and visible
"damage" (cracks), then a clear payoff (surrender screen with your stats).

## Core loop

1. Tap the face.
2. Each tap raises "rage" and plays a synthesized thud tied to the current
   rage level (angrier = lower pitch, louder, noisier).
3. Rage decays slowly if you stop tapping — sustained aggression is required.
4. Visual feedback (shake amplitude, hue shift, contrast, cracks, face
   expression) all read off the same 0–1 rage value, so everything escalates
   in lockstep.
5. At max rage: glitch-out animation, break sound, surrender screen showing
   click count + time taken. Restart resets everything.

## Stretch ideas (post-v0, only if time allows)

- Shareable result card (screenshot-style) with click count / time, for the
  "worth showing a friend" judging criterion.
- Leaderboard of fastest "break" times (would need a tiny backend — evaluate
  against the 7-day timeline before committing to this).
- Alternate "victims" (switch the face for other reactive objects) as a
  lightweight variety feature.
- Haptic feedback on mobile (`navigator.vibrate`) tied to rage tier.

## Explicitly out of scope for v0

- Accounts, persistence, backend — the build should work fully client-side so
  "can someone outside the team open and try it" has zero failure modes.
