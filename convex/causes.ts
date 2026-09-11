export const CAUSES = [
  "scope creep",
  "got a real job",
  "lost interest at 80%",
  "the framework died",
  "rewrote it instead",
  "a startup shipped it first",
  "the free tier ran out",
  "the domain expired",
  "waiting on a design system",
  "the API got deprecated",
  "the Figma file got too big",
  "it worked, nobody came",
  "the hackathon ended",
  "never told anyone about it",
] as const;

export type Cause = (typeof CAUSES)[number];
