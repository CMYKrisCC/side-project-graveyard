let origin = { x: 0, y: 0 };
let listening = false;

export function trackPointer() {
  if (listening || typeof window === "undefined") return;
  listening = true;
  window.addEventListener(
    "pointerdown",
    (event) => {
      origin = { x: event.clientX, y: event.clientY };
    },
    true
  );
}

// Orbiting the camera ends in a click on whatever is under the cursor, which
// would teleport you or drop a flower you never meant to leave.
export function wasDrag(event, threshold = 9) {
  return Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > threshold;
}
