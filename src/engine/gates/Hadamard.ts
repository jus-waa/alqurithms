import type { Qubit } from "../Qubit";
import { applyGate } from "../Qubit";

// hadamard matrix 
export const hadamardMatrix: number[][] = [
  [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
  [1 / Math.sqrt(2), -1 / Math.sqrt(2)],
]

export function applyHadamard(state: Qubit): Qubit {
  return applyGate(hadamardMatrix, state);
}
/*
  this can now be used as:
  import { ket0 } from '../Qubit';
  import { applyHadamard } from './Hadamard';

  const result = applyHadamard(ket0);
  console.log(result);
*/

// apply Hadamard to a specific qubit in a multi-qubit system
export function applyHadamardToQubit(state: Qubit, targetQubit: number): Qubit {
  const n = state.length;
  const newState: number[] = new Array(n).fill(0);
  
  // for each basis state
  for (let i = 0; i < n; i++) {
    // check if the target qubit is |0⟩ or |1⟩ in this basis state
    const bit = (i >> targetQubit) & 1;
    
    // calc which basis state this amplitude contributes to after flipping
    const flippedIndex = i ^ (1 << targetQubit);
    
    // apply Hadamard 
    if (bit === 0) {
      // |0⟩ → (|0⟩ + |1⟩)/√2
      newState[i] += state[i] / Math.sqrt(2);
      newState[flippedIndex] += state[i] / Math.sqrt(2);
    } else {
      // |1⟩ → (|0⟩ - |1⟩)/√2
      newState[flippedIndex] += state[i] / Math.sqrt(2);
      newState[i] -= state[i] / Math.sqrt(2);
    }
  }
  
  return newState;
}