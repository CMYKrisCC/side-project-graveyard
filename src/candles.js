export const CANDLE_HOURS = 24;
const CANDLE_MS = CANDLE_HOURS * 60 * 60 * 1000;
const FRESH_MS = 30 * 60 * 1000;

export function candleLife(candleLitAt, now = Date.now()) {
  if (!candleLitAt) return 0;
  return Math.max(0, Math.min(1, 1 - (now - candleLitAt) / CANDLE_MS));
}

export function hoursLeft(candleLitAt, now = Date.now()) {
  return Math.ceil((candleLife(candleLitAt, now) * CANDLE_MS) / (60 * 60 * 1000));
}

export function isFresh(buriedAt, now = Date.now()) {
  return now - buriedAt < FRESH_MS;
}
