export const MEMORIALS = [
  "In Loving Memory",
  "In Memory Of",
  "In Cherished Memory",
  "In Fond Memory",
  "Forever in Our Hearts",
  "Gone but Not Forgotten",
  "Rest in Peace",
  "Always Remembered",
  "Deeply Loved, Sadly Missed",
  "Beloved and Remembered",
  "Remembered with Love",
  "Until We Meet Again",
  "Forever Loved",
  "At Peace",
  "Here Lies",
  "Sacred to the Memory Of",
  "In Eternal Rest",
  "A Life Well Lived",
  "Loved Beyond Words",
  "Your Memory Lives On",
];

// Derived from the plot so a grave keeps its epitaph line forever, but
// neighbouring graves don't march through the list in order.
export function memorialFor(plot) {
  const scrambled = (plot * 2654435761) % 4294967296;
  return MEMORIALS[Math.floor(scrambled / 1000) % MEMORIALS.length];
}
