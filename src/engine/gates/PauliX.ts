import type { Qubit } from '../Qubit';

// pauli-x matrix
export const pauliXMatrix: number[][] = [
  [0, 1],
  [1, 0]
]

// apply Pauli X
export function applyPauliXToQubit(state: Qubit, targetQubit: number): Qubit {
  const n = state.length; 
  const newState: number[] = new Array(n).fill(0)
  // basically magstart similar to hadamard since check 0 or 1 then flip 

  for (let i = 0; i < n; i++) {
    const bit = (i >> targetQubit) & 1;
    const flippedIndex = i ^ (1 << targetQubit);

    // just flip then assign value 
    newState[flippedIndex] = state[i];
    console.log('1:', bit);
  }
  return newState
} 