// measurementgate.ts
import type { Qubit } from '../qubit/Qubit';

export function measureQubit(
  state: Qubit,
  measuredBits: number[],
  qubitCount: number,
  shots = 1024
): Qubit {
  const n = state.length;
  let sum = 0;
  const cumProbs = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    sum += state[i] * state[i];
    cumProbs[i] = sum;
  }
  const counts: Record<number, number> = {};
  for (let s = 0; s < shots; s++) {
    const rand = Math.random() * sum;
    let stateIndex = cumProbs.findIndex(p => rand <= p);
    if (stateIndex === -1) stateIndex = n - 1;
    let finalIndex = 0;
    for (let q = 0; q < qubitCount; q++) {
      if (measuredBits.includes(q)) {
        if ((stateIndex & (1 << q)) !== 0) finalIndex |= (1 << q);
      }
    }
    counts[finalIndex] = (counts[finalIndex] || 0) + 1;
  }
  const histogramState = new Array(n).fill(0);
  for (const [key, count] of Object.entries(counts)) {
    histogramState[Number(key)] = Math.sqrt(count / shots);
  }
  return histogramState;
}
