// measurementgate.ts
import type { Qubit } from '../qubit/Qubit';

// state is the arr of num of prob amplitudes of all possible qubit combination
// targetQubit is speific qubit num ex. 3 qubit; q0, q1, q2 == 0, 1, 2
// numQubits only for clarity/future use 
// reuslt will only be 0 or 1
export function measureQubit(state: Qubit, qubitIndex: number, qubitCount: number): { result: number, newState: Qubit } {
  const n = state.length;
  
  // Sum probabilities where qubitIndex bit = 0
  let prob0 = 0;
  for (let i = 0; i < n; i++) {
    if (((i >> qubitIndex) & 1) === 0) {
      prob0 += state[i] * state[i];
    }
  }

  // Randomly collapse (or deterministic if prob is 0 or 1)
  const result = Math.random() < prob0 ? 0 : 1;

  // Collapse and renormalize
  const newState: number[] = new Array(n).fill(0);
  let norm = 0;

  for (let i = 0; i < n; i++) {
    if (((i >> qubitIndex) & 1) === result) {
      newState[i] = state[i];
      norm += state[i] * state[i];
    }
  }

  const normFactor = Math.sqrt(norm);
  for (let i = 0; i < n; i++) {
    newState[i] /= normFactor;
  }

  return { result, newState };
}