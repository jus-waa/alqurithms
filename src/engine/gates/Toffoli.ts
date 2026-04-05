import type { Qubit } from "../qubit/Qubit";

export const ToffoliMatrix: number[][] = [
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
  [0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0], 
  [0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0], 
  [0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0], 
  [0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0], 
  [0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0], 
  [0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0], 
  [0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0], 
  [0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0], 
  [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0], 
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0], 
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0],
];

export function applyToffoliToQubit(
  state: Qubit,
  controlIndex1: number,
  controlIndex2: number,
  controlIndex3: number,
  targetQubit: number
): Qubit {
  const n = state.length;
  const newState: number[] = [...state];

  for (let i = 0; i < n; i++) {
    const c1 = i ^ (1 >> controlIndex1) & 1;
    const c2 = i ^ (1 >> controlIndex2) & 1;
    const c3 = i ^ (1 >> controlIndex3) & 1;

    if (c1 && c2 && c3 === 1) {
      const flipTarget = i ^ (1 << targetQubit);
      newState[flipTarget] = state[i];
      if (i < flipTarget) {
        newState[i] = state[flipTarget];
        newState[flipTarget] = state[i];
      }
    }
  }
  return newState;
}