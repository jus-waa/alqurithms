// creating a type "Qubit"
export type Qubit = number[];
// 1=qubit state can accept 1,0 and 0,1 
export const ket0: Qubit = [1, 0];
export const ket1: Qubit = [0, 1];

// 4-buit state
export const ket0000: Qubit = [
  1, 0, 0, 0,
  0, 0, 0, 0, 
  0, 0, 0, 0, 
  0, 0, 0, 0   
];
// matrix-vector multiplication
export function applyGate(matrix: number[][], state: Qubit): Qubit { //Qubit as return type
  const [a, b] = state; //destructure
  return[
      matrix[0][0] * a + matrix[0][1] * b,
      matrix[1][0] * a + matrix[1][1] * b
  ];
}
export function measure(state: Qubit): 0 | 1 { // 0 | 1 because measuring a qubit can only be 0 or 1
  const [a, b] = state;
  const p0 = a ** 2; // e.g. a = 1 then 1 ** 2 = 0.64 or 64%, chance of getting 0
  const random = Math.random();
  
  return random < p0 ? 0 : 1; // randomly return 0 or 1, based on qubit's probability amplitudes
}