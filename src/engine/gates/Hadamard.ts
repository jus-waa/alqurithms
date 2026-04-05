import type { Qubit } from '../qubit/Qubit';
//note: you still havent used this
export const hadamardMatrix: number[][] = [
  [1 / Math.sqrt(2), 1 / Math.sqrt(2)],
  [1 / Math.sqrt(2), -1 / Math.sqrt(2)],
]
/*
  for each basis state
  check if the target qubit is |0⟩ or |1⟩ in this basis state,
  check which basis state it partners to,
  then apply Hadamard   
  (n = state.length; // basically 16 cause i limit it to 4 qubits)
*/
export function applyHadamardToQubit(state: Qubit, targetQubit: number): Qubit {
  const n = state.length;
  const newState: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    if (((i >> targetQubit) & 1) === 0) {  
      const j = i | (1 << targetQubit);   
      newState[i] = (state[i] + state[j]) / Math.sqrt(2);
      newState[j] = (state[i] - state[j]) / Math.sqrt(2);
    }
  }
  return newState;
}