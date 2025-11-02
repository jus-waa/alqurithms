import type { Qubit } from '../Qubit';

// hadamard matrix 
export const hadamardMatrix: number[][] = [
  [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
  [1 / Math.sqrt(2), -1 / Math.sqrt(2)],
]

// apply Hadamard to circuit
export function applyHadamardToQubit(state: Qubit, targetQubit: number): Qubit {
  const n = state.length; // basically 16 cause i limit it to 4 qubits
  const newState: number[] = new Array(n).fill(0);
  
  // for each basis state
  for (let i = 0; i < n; i++) {
    // check if the target qubit is |0⟩ or |1⟩ in this basis state
    const bit = (i >> targetQubit) & 1;
    //console.log(bit);
    
    // check which basis state it partners to
    const flippedIndex = i ^ (1 << targetQubit);
    //console.log(flippedIndex);
    
    // apply Hadamard   
    if (bit === 0) {
      // |0⟩ -> (|0⟩ + |1⟩)/sqrt(2)
      newState[i] += state[i] / Math.sqrt(2);
      newState[flippedIndex] += state[i] / Math.sqrt(2);
      console.log('0:', bit);
    } else {
      // |1⟩ -> (|0⟩ - |1⟩)/sqrt(2)
      newState[flippedIndex] += state[i] / Math.sqrt(2);
      newState[i] -= state[i] / Math.sqrt(2);
      console.log('1:', bit);
    }
  }
  return newState;
}