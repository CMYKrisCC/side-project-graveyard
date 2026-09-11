const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
};

// First-pass filter. Catches lazy abuse, not a determined attacker — the report
// button and the `hidden` flag are the real backstop.
const BANNED = [
  "fuck",
  "shit",
  "cunt",
  "bitch",
  "whore",
  "rape",
  "nigg",
  "fagg",
  "retard",
  "kike",
  "spic",
  "tranny",
  "kill yourself",
  "kys",
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .split("")
    .map((ch) => LEET[ch] ?? ch)
    .join("")
    .replace(/[^a-z ]/g, "")
    .replace(/(.)\1{2,}/g, "$1$1");
}

export function isClean(text: string): boolean {
  const normal = normalize(text);
  const collapsed = normal.replace(/ /g, "");
  return !BANNED.some((word) => normal.includes(word) || collapsed.includes(word));
}

export function sanitize(text: string, maxLength: number): string {
  return text.replace(/\s+/g, " ").trim().slice(0, maxLength);
}
