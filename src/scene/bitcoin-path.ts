/** A decorative stochastic path, independent of market data and model results. */
export interface PriceMove {
  duration: number;
  delta: number;
}
export interface PriceRegime {
  direction: 1 | -1;
  duration: number;
  moves: PriceMove[];
}
export interface PricePoint {
  time: number;
  price: number;
}
export const PRICE_WINDOW = 12;
export const PRICE_START = 100;

export function seededRandom(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createPriceRegime(random = Math.random): PriceRegime {
  const direction = random() < 0.6 ? 1 : -1;
  const duration = 1.8 + random() * 2.4;
  // 4, 6 or 8 moves: six on average over a three-second mean regime.
  const count = 2 * (2 + Math.floor(random() * 3));
  const signs = Array.from({ length: count }, (_, i) =>
    i < count / 2 ? 1 : -1,
  );
  // Shuffling balanced signs gives each position a 50/50 marginal direction.
  // Signs are deliberately not independent: both directions must be present
  // for amplitudes alone to determine the regime's net movement.
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const previous = signs[i]!;
    signs[i] = signs[j]!;
    signs[j] = previous;
  }
  const weights = signs.map(() => 0.45 + random() * 1.1);
  const net = 0.65 + random() * 0.65;
  const counter = net * (0.4 + random() * 0.35);
  const upTotal = direction > 0 ? counter + net : counter;
  const downTotal = direction < 0 ? counter + net : counter;
  const upWeight = weights.reduce(
    (sum, w, i) => sum + (signs[i]! > 0 ? w : 0),
    0,
  );
  const downWeight = weights.reduce(
    (sum, w, i) => sum + (signs[i]! < 0 ? w : 0),
    0,
  );
  const deltas = signs.map(
    (sign, i) =>
      sign *
      weights[i]! *
      (sign > 0 ? upTotal / upWeight : downTotal / downWeight),
  );
  // Larger movements take longer, with jitter, rather than becoming fast spikes.
  const timing = deltas.map(
    (delta) => Math.abs(delta) * (0.85 + random() * 0.3),
  );
  const totalTime = timing.reduce((a, b) => a + b, 0);
  return {
    direction,
    duration,
    moves: deltas.map((delta, i) => ({
      duration: 0.12 + ((duration - count * 0.12) * timing[i]!) / totalTime,
      delta,
    })),
  };
}

const ease = (t: number) => t * t * (3 - 2 * t);

export function createPricePath(random = Math.random) {
  // Identical initial geometry in the poster and canvas; fresh random regimes
  // take over after the prefilled history. Hover resumes instead of restarting.
  let source = seededRandom(20261014);
  let regime = createPriceRegime(source);
  let moveIndex = 0;
  let moveStart = 0;
  let startPrice = PRICE_START;
  let time = 0;
  let points: PricePoint[] = [{ time, price: startPrice }];
  const move = () => regime.moves[moveIndex]!;
  function advance(seconds: number) {
    if (!Number.isFinite(seconds) || seconds < 0)
      throw new Error('Invalid price time step');
    time += seconds;
    while (time >= moveStart + move().duration) {
      moveStart += move().duration;
      startPrice += move().delta;
      points.push({ time: moveStart, price: startPrice });
      moveIndex++;
      if (moveIndex === regime.moves.length) {
        regime = createPriceRegime(source);
        moveIndex = 0;
      }
    }
    const first = points.findIndex(
      (point) => point.time >= time - PRICE_WINDOW - 2,
    );
    if (first > 1) points = points.slice(first - 1);
  }
  function priceAt(at: number) {
    let index = points.length - 1;
    while (index > 0 && points[index]!.time > at) index--;
    const from = points[index]!;
    const to = points[index + 1] ?? {
      time: moveStart + move().duration,
      price: startPrice + move().delta,
    };
    const progress = Math.max(
      0,
      Math.min(1, (at - from.time) / (to.time - from.time)),
    );
    return from.price + (to.price - from.price) * ease(progress);
  }
  function snapshot() {
    const samples = Array.from({ length: 361 }, (_, i) => {
      const at = time - PRICE_WINDOW + (i * PRICE_WINDOW) / 360;
      return { time: at, price: priceAt(at) };
    });
    return { time, price: priceAt(time), samples };
  }
  advance(PRICE_WINDOW);
  source = random;
  return { advance, snapshot };
}
