const PREFIX = "/g/";

export function graveIdFromUrl() {
  const { pathname, searchParams } = new URL(window.location.href);
  if (pathname.startsWith(PREFIX)) return pathname.slice(PREFIX.length) || null;
  return searchParams.get("grave");
}

export function graveUrl(graveId) {
  return `${window.location.origin}${PREFIX}${graveId}`;
}

export function showGraveInUrl(graveId) {
  window.history.replaceState(null, "", PREFIX + graveId);
}

export async function copyGraveUrl(graveId) {
  const url = graveUrl(graveId);

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    // Clipboard access is refused outside a secure context or without
    // permission; the visitor can still copy the link from the field.
    return false;
  }
}
