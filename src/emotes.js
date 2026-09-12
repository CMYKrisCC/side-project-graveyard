export const EMOTE_MS = 3200;

export const EMOTES = [
  { id: "wave", label: "Wave", key: "w", symbol: "👋" },
  { id: "bow", label: "Bow", key: "b", symbol: "🙇" },
  { id: "mourn", label: "Mourn", key: "m", symbol: "🕯️" },
];

const BY_ID = new Map(EMOTES.map((emote) => [emote.id, emote]));

export function activeEmote(visitor, now = Date.now()) {
  if (!visitor.emote || !visitor.emoteAt) return null;
  if (now - visitor.emoteAt > EMOTE_MS) return null;
  return BY_ID.get(visitor.emote) ?? null;
}

// The ghost has no skeleton, so emotes are expressed by moving the whole
// body — a tilt, a dip, a sink — rather than by animation.
export function emotePose(emote, elapsed) {
  if (!emote) return { tilt: 0, pitch: 0, lift: 0 };

  switch (emote.id) {
    case "wave":
      return { tilt: Math.sin(elapsed * 9) * 0.3, pitch: 0, lift: 0.1 };
    case "bow": {
      const dip = Math.min(1, elapsed * 3);
      return { tilt: 0, pitch: dip * 0.55, lift: -0.1 * dip };
    }
    case "mourn":
      return { tilt: 0, pitch: 0.18, lift: -0.25 - Math.sin(elapsed * 1.6) * 0.04 };
    default:
      return { tilt: 0, pitch: 0, lift: 0 };
  }
}
