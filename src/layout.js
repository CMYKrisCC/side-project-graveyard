// Spacing is set by the inscription, not the headstone: each grave's text block
// is about 3 units wide, so plots have to clear that or neighbouring
// inscriptions collide once they turn to face the camera.
const FIRST_RING_RADIUS = 9;
const RING_GAP = 5;
const GRAVE_GAP = 5.2;

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
