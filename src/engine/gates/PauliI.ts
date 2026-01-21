import type { Qubit } from '../Qubit';

export const PauliIMatrix: number[][] = [
  [1, 0],
  [0, 1]
]
//no operation gate, included targetQubit for clarity
export function applyPauliIToQubit(state: Qubit, targetQubit: number): Qubit {
  return [...state];
} 