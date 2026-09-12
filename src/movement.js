export const WALK_SPEED = 3.5;
export const STALE_AFTER = 45000;

// Everyone replays the same walk from the same timestamp, so a single stored
// destination is enough — no position streaming.
export function visitorPosition(visitor, now) {
  const dx = visitor.toX - visitor.fromX;
  const dz = visitor.toZ - visitor.fromZ;
  const distance = Math.hypot(dx, dz);
  const duration = (distance / WALK_SPEED) * 1000;
  const t = duration <= 0 ? 1 : Math.min(1, Math.max(0, (now - visitor.startedAt) / duration));

  return {
    x: visitor.fromX + dx * t,
    z: visitor.fromZ + dz * t,
    angle: distance > 0.01 ? Math.atan2(dx, dz) : 0,
    walking: t < 1,
  };
}
