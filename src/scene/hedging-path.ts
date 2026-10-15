// Deterministic artwork, not a pricing model or a trained hedging policy.
export const HEDGE_WINDOW = 14;
const START_TIME = 24;
const REBALANCE_INTERVAL = 1.6;

function randomAt(index: number, salt: number) {
  let x = Math.imul(index + salt, 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return ((x ^ (x >>> 16)) >>> 0) / 4294967296;
}

function noise(time: number, salt: number) {
  const index = Math.floor(time);
  const fraction = time - index;
  const blend = fraction * fraction * (3 - 2 * fraction);
  return (
    2 *
      (randomAt(index, salt) * (1 - blend) +
        randomAt(index + 1, salt) * blend) -
    1
  );
}

export function illustrativePrice(time: number) {
  return (
    100 +
    4.1 * noise(time / 10, 71) +
    1.7 * noise(time / 3, 113) +
    0.5 * noise(time / 0.55, 221)
  );
}

function rebalance(index: number) {
  const time = index * REBALANCE_INTERVAL + randomAt(index, 37) * 0.7;
  const price = illustrativePrice(time);
  // A simple reactive rule makes the rebalancing legible; never uses future prices.
  const position = 0.08 + 0.84 / (1 + Math.exp(-0.65 * (price - 100)));
  return { time, price, position };
}

export function createHedgeFrame(elapsed: number) {
  const end = START_TIME + elapsed;
  const start = end - HEDGE_WINDOW;
  const events = [];
  for (
    let i = Math.floor(start / REBALANCE_INTERVAL) - 1;
    i <= Math.floor(end / REBALANCE_INTERVAL);
    i++
  ) {
    const event = rebalance(i);
    if (event.time <= end) events.push(event);
  }
  const previous = events.filter((event) => event.time <= start).at(-1)!;
  const visible = events.filter((event) => event.time > start);
  const latest = events.at(-1)!;
  const samples = Array.from({ length: 281 }, (_, index) => {
    const time = start + (index / 280) * HEDGE_WINDOW;
    return { time, price: illustrativePrice(time) };
  });
  const holdings = [{ time: start, position: previous.position }];
  let position = previous.position;
  for (const event of visible) {
    holdings.push({ time: event.time, position });
    holdings.push({ time: event.time, position: event.position });
    position = event.position;
  }
  holdings.push({ time: end, position });
  return {
    start,
    end,
    samples,
    holdings,
    events: visible,
    price: samples.at(-1)!.price,
    position,
    sinceRebalance: end - latest.time,
  };
}
