const FIRST_RING_RADIUS = 6;
const RING_GAP = 3.4;
const GRAVE_GAP = 2.8;

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
