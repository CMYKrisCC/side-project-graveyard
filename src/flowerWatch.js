const KEY = "spg.flowers";

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}

function write(counts) {
  try {
    localStorage.setItem(KEY, JSON.stringify(counts));
  } catch {
    // Storage can be refused; the visitor just won't get the catch-up notice.
  }
}

// Compares the flower counts on your own graves against what they were the
// last time you were here, then records the new numbers.
export function flowersSinceLastVisit(myGraves) {
  const previous = read();
  const current = {};
  const news = [];

  for (const grave of myGraves) {
    current[grave._id] = grave.flowers;
    const before = previous[grave._id];
    if (before !== undefined && grave.flowers > before) {
      news.push({ ...grave, gained: grave.flowers - before });
    }
  }

  write(current);
  return news;
}
