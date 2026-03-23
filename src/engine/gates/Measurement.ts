// measurementgate.ts
import type { Qubit } from '../Qubit';

export function measureQubit(
  state: Qubit,
  targetQubit: number,
  numQubits: number
): { result: 0 | 1; newState: Qubit } {
  const dim = state.length;
  // Match Hadamard's little-endian convention: q0 = LSB
  const bitIndex = targetQubit; // NOT numQubits - 1 - targetQubit

  let prob0 = 0;
  for (let i = 0; i < dim; i++) {
    if (((i >> bitIndex) & 1) === 0) {
      prob0 += Math.pow(Math.abs(state[i] as number), 2);
    }
  }

  const result: 0 | 1 = Math.random() < prob0 ? 0 : 1;

  const newState: Qubit = [...state] as Qubit;
  let norm = 0;

  for (let i = 0; i < dim; i++) {
    const bit = (i >> bitIndex) & 1;
    if (bit !== result) {
      newState[i] = 0;
    } else {
      norm += Math.pow(Math.abs(newState[i] as number), 2);
    }
  }

  const sqrtNorm = Math.sqrt(norm);
  for (let i = 0; i < dim; i++) {
    if (newState[i] !== 0) {
      (newState[i] as number) /= sqrtNorm;
    }
  }

  console.log(`Measured q${targetQubit}: ${result}, newState:`, newState);
  return { result, newState };
}