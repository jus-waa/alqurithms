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