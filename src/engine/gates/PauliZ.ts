import type { Qubit } from '../Qubit';

export const pauliZMatrix: number[][] = [
  [1, 0],
  [0, -1]
]

export function applyPauliZToQubit(state: Qubit, targetQubit: number): Qubit {
  const n = state.length;
  const newState: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const bit = (i >> targetQubit) & 1;
    if (bit === 0) {
      newState[i] += state[i];
      console.log('0', bit);
    } else if (bit === 1) {
      newState[i] += -state[i];
      console.log('1', bit);
    }
  }
  return newState;
}