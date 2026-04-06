// measurementgate.ts
import type { Qubit } from '../qubit/Qubit';

// state is the arr of num of prob amplitudes of all possible qubit combination
// targetQubit is speific qubit num ex. 3 qubit; q0, q1, q2 == 0, 1, 2
// numQubits only for clarity/future use 
// reuslt will only be 0 or 1
export function measureQubit( 
  state: Qubit, 
  targetQubit: number, 
  numQubits: number
): { result: 0 | 1; newState: Qubit } {
  // q0 least sig
  // probability of measuring 0
  const dim = state.length;
  const bitIndex = targetQubit; 
  let prob0 = 0;
  for (let i = 0; i < dim; i++) {
    if (((i >> bitIndex) & 1) === 0) {
      prob0 += Math.pow(Math.abs(state[i] as number), 2); //prob = |amp|^2
    }
  }
  // type annotation, then if math.rand < prob0 return 0 else 1
  const result: 0 | 1 = Math.random() < prob0 ? 0 : 1; // random collapse.

  // renormalization
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