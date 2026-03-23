import type { Qubit } from '../Qubit';

//barrier ,included targetQubit for expected argument sa circuit
export function applyBarrierToQubit(state: Qubit, targetQubit: number): Qubit {
  return [...state];
} 