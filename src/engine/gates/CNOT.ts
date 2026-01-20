import type { Qubit } from "../Qubit";

export const CNOTMatrix: number[][] = [
  [1,0,0,0],
  [0,1,0,0],
  [0,0,0,1],
  [0,0,1,0]
]

/*
  if control bit eqauls to 1 then flip target,
  else is just do nothing state remains
*/
export function applyCNOTtoQubit(state: Qubit, controlIndex: number, targetQubit: number): Qubit {
  const n = state.length;
  const newState: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    const controlBit = (i >> controlIndex) & 1;

    if (controlBit === 1) {
      const flipTarget = i ^ (1 << targetQubit);
      newState[flipTarget] = state[i];
      console.log('1: ', controlBit);
    } else {
      newState[i] = state[i];
    }
  }
  return newState;
}