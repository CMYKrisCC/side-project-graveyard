// Spacing is set by the inscription, not the headstone: each grave's text block
// is about 3 units wide, so plots have to clear that or neighbouring
// inscriptions collide once they turn to face the camera.
export const FIRST_RING_RADIUS = 9;
export const RING_GAP = 5;
export const GRAVE_GAP = 5.2;
const MIN_YARD = 30;
const YARD_MARGIN = 13;

export const slotsInRing = (radius) =>
  Math.max(8, Math.floor((2 * Math.PI * radius) / GRAVE_GAP));

// How far out the graves currently reach.
export function occupiedRadius(graveCount) {
  let remaining = graveCount;
  let ring = 0;
  let radius = FIRST_RING_RADIUS;

  while (remaining > 0) {
    radius = FIRST_RING_RADIUS + ring * RING_GAP;
    remaining -= slotsInRing(radius);
    ring += 1;
  }

  return radius;
}

// The graveyard grows rather than filling up: the fence, the treeline and the
// mausoleum all move outward as the rings reach them, so burials never have to
// be refused and graves never land in the scenery.
export function yardRadiusFor(graveCount) {
  return Math.max(MIN_YARD, occupiedRadius(graveCount) + YARD_MARGIN);
}

// A plot number is all we store — position is derived, so two graves can never
// occupy the same spot and the cemetery grows outward in rings from the gate.
export function plotPosition(plot) {
  let remaining = plot;
  let ring = 0;

  for (;;) {
    const radius = FIRST_RING_RADIUS + ring * RING_GAP;
    const slots = Math.max(8, Math.floor((2 * Math.PI * radius) / GRAVE_GAP));

    if (remaining < slots) {
      const angle = (remaining / slots) * Math.PI * 2;
      return {
        x: Math.sin(angle) * radius,
        z: Math.cos(angle) * radius,
        angle,
        radius,
      };
    }

    remaining -= slots;
    ring += 1;
  }
}
