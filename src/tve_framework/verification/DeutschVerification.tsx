// verification magccontain ng expected statevecotrs for each step of Deutsch
const h = 1 / Math.sqrt(2); // -0.7071
const h2 = h / Math.sqrt(2); // 0.5

export const deutschExpectedStates: Record<string, number[][]> = {
  f0: [
    [1, 0, 0, 0],
    [0, 0, h, h],
    [h2, h2, -h2, -h2],
    [h2, h2, -h2, -h2],
    [0, 0, 1, 0],
  ],
}