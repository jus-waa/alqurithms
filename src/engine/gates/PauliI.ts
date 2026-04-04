import type { Qubit } from '../qubit/Qubit';

export const PauliIMatrix: number[][] = [
  [1, 0],
  [0, 1]
]
//no operation gate, included targetQubit for expected argument sa circuit
export function applyPauliIToQubit(state: Qubit, targetQubit: number): Qubit {
  return [...state];
} 