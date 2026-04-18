// ==========================================
// Fidelity Utilities for Quantum State Comparison
// ==========================================

// Computes fidelity between two real-valued state vectors
// F = |<ψ | φ>|^2
export function fidelity(actual: number[], expected: number[]): number {
  if (actual.length !== expected.length) {
    throw new Error("State vectors must have the same length.");
  }

  let dot = 0;

  for (let i = 0; i < actual.length; i++) {
    dot += actual[i] * expected[i];
  }

  const f = dot * dot;
  return Math.min(1, Math.max(0, f));
}

export function normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) {
    throw new Error("Cannot normalize a zero vector.");
  }
  return vec.map(v => v / norm);
}

// Convenience function: normalize both vectors then compute fidelity
export function computeFidelity(actual: number[], expected: number[]): number {
  const normActual = normalize(actual);
  const normExpected = normalize(expected);

  return fidelity(normActual, normExpected);
}

// Optional helper: convert fidelity to percentage
export function fidelityPercent(f: number): string {
  return (f * 100).toFixed(2) + "%";
}