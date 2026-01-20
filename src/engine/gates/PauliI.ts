import type { Qubit } from '../Qubit';

export const PauliIMatrix: number[][] = [
  [1, 0],
  [0, 1]
]

export function applyPauliIToQubit(state: Qubit, targetQubit: number): Qubit {
  return [...state];
} 