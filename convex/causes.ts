export const CAUSE_GROUPS = [
  {
    label: "Planning & Process",
    causes: [
      "Scope creep was too real.",
      "Waiting on a design system.",
      "Refactored into oblivion.",
      "Designed but never built.",
      "Pivoted too many times.",
      "The hackathon ended.",
    ],
  },
  {
    label: "Technical Difficulties",
    causes: [
      "The framework failed.",
      "The dependencies revolted.",
      "The build stopped building.",
      "The API got deprecated.",
      "The data never arrived.",
      "Vibe coded too close to the sun.",
    ],
  },
  {
    label: "Money & Maintenance",
    causes: [
      "No money was made.",
      "The free tier expired.",
      "The domain expired.",
      "The API bill arrived.",
      "Ran out of coffee.",
    ],
  },
  {
    label: "Launch & Discovery",
    causes: [
      "It worked, nobody came.",
      "Never told anyone about it.",
      "Built but never launched.",
      "The feedback was ‘cool idea’.",
      "Coming soon since 2023.",
    ],
  },
  {
    label: "Product & Market",
    causes: [
      "Another startup shipped it first.",
      "Solved a problem nobody had.",
      "The users wanted something else.",
    ],
  },
  {
    label: "Personal & Mysterious",
    causes: ["Motivation not found.", "An end too grotesque for words."],
  },
] as const;

export const CAUSES: readonly string[] = CAUSE_GROUPS.flatMap((group) => [...group.causes]);
