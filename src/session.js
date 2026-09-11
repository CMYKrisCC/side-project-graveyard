const KEY = "spg.session";

let cached = null;

export function getSessionId() {
  if (cached) return cached;

  try {
    const stored = localStorage.getItem(KEY);
    if (stored) {
      cached = stored;
      return cached;
    }
    cached = crypto.randomUUID();
    localStorage.setItem(KEY, cached);
  } catch {
    // Private browsing can refuse storage; a per-tab identity still works.
    cached = crypto.randomUUID();
  }

  return cached;
}

export function getTint() {
  const id = getSessionId();
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
  return hash;
}
