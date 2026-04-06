import type { Qubit } from "../../engine/qubit/Qubit";

export type DeutschFunction = "f0" | "f1" | "f2" | "f3";

export type VerificationResult = {
  step: number;
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
};

// for floating point comparison, kase di naman exact. e.g. 0.70710678118 
// 0.05 so that incase 0.05 yung difference okay lang tatanggapin
const fpc = 0.05;

function approx(a: number, b: number) {
  return Math.abs(a - b) < fpc;
}

function amp(state: Qubit, i: number): number {
  const stateVal = state[i];
  return (typeof stateVal === "number") ? stateVal : (stateVal as [number, number])[0];
}

// "" are for barriers
const labels: Record<number, string> = {
  1: "Initial State",
  2: "Superposition",
  4: "Oracle",
  6: "Final Hadamard",
  7: "Measurement",
};

const expectedState: Record<number, Record<DeutschFunction, string>> = {
  1: { f0: "|0⟩|1⟩", f1: "|0⟩|1⟩", f2: "|0⟩|1⟩", f3: "|0⟩|1⟩" },
  2: { f0: "|+⟩|−⟩", f1: "|+⟩|−⟩", f2: "|+⟩|−⟩", f3: "|+⟩|−⟩" },
  4: {
    f0: "|+⟩|−⟩  (constant)",
    f1: "|−⟩|−⟩  (balanced)",
    f2: "|−⟩|−⟩  (balanced)",
    f3: "|+⟩|−⟩  (constant)",
  },
  6: {
    f0: "|0⟩ on q0 -> constant",
    f1: "|1⟩ on q0 -> balanced",
    f2: "|1⟩ on q0 -> balanced",
    f3: "|0⟩ on q0 -> constant",
  },
  7: {
    f0: "Measure 0 -> CONSTANT",
    f1: "Measure 1 -> BALANCED",
    f2: "Measure 1 -> BALANCED",
    f3: "Measure 0 -> CONSTANT",
  },
};

export function verifyDeutschStep(
  step: number,
  state: Qubit,
  fn: DeutschFunction
): VerificationResult | null {
  // safety 
  const label = (step === 0) ? "Initial State" : labels[step] ?? `Step ${step}`;
  const expected = (step === 0) ? "|0⟩|1⟩" : expectedState[step]?.[fn] ?? "—";
  let passed = false;
  let actual = "";
  if (step === 3 || step === 5) return null;
  
  // step 1,3,5 includes barrier kaya auto true nlng passed at actual === prev actual
  if (step === 0) {
    passed = approx(Math.abs(amp(state, 1)), 1.0);
    actual = passed ? "|0⟩|1⟩ confirmed" : "Unexpected initial state";
  } else if (step === 1) {
    // |01⟩: state vector index 1 = 1.0
    passed = true;
    actual = passed ? "|0⟩|1⟩ confirmed" : "Unexpected initial state";

  } else if (step === 2) {
    // All 4 amplitudes ≈ ±0.5
    const allSuper = [0, 1, 2, 3].every(i => approx(Math.abs(amp(state, i)), 0.5));
    passed = allSuper;
    actual = passed ? "Equal superposition confirmed" : "Not in superposition";

  } else if (step === 4) {
    step = 3;
    if (fn === "f0" || fn === "f3") {
      // |+⟩|−⟩: [0.5, -0.5, 0.5, -0.5]
      passed =
        approx(amp(state, 0), -0.5) &&
        approx(amp(state, 1), -0.5) &&
        approx(amp(state, 2),  0.5) &&
        approx(amp(state, 3),  0.5);
      actual = passed ? "|+⟩|−⟩ confirmed" : "Oracle output mismatch";
      console.log("Step", step, "State:", state);
    } else {
      // |−⟩|−⟩: [-0.5, 0.5, -0.5, 0.5] or similar sign variants
      passed =
        approx(amp(state, 0), -0.5) &&
        approx(amp(state, 1), -0.5) &&
        approx(amp(state, 2),  0.5) &&
        approx(amp(state, 3),  0.5);
      actual = passed ? "|−⟩|−⟩ confirmed" : "Oracle output mismatch";
      console.log("Step", step, "State:", state);
    }
  } else if (step === 6) {
    if (fn === "f0" || fn === "f3") {
      passed = Math.abs(amp(state, 0)) > Math.abs(amp(state, 2));
      actual = passed ? "|0⟩ dominant on q0" : "|1⟩ dominant — mismatch";
      console.log("Step", step, "State:", state);
    } else {
      passed = Math.abs(amp(state, 2)) > Math.abs(amp(state, 0));
      actual = passed ? "|1⟩ dominant on q0" : "|0⟩ dominant — mismatch";
      console.log("Step", step, "State:", state);
    }

  } else if (step === 7) {
    const zeroCollapsed = approx(Math.abs(amp(state, 0)), 1.0) || approx(Math.abs(amp(state, 1)), 1.0);
    const oneCollapsed  = approx(Math.abs(amp(state, 2)), 1.0) || approx(Math.abs(amp(state, 3)), 1.0);
    if (fn === "f0" || fn === "f3") {
      passed = zeroCollapsed;
      actual = zeroCollapsed ? "Measured 0 → CONSTANT" : "Measured 1 — wrong";
      console.log("Step", step, "State:", state);
    } else {
      passed = oneCollapsed;
      actual = oneCollapsed ? "Measured 1 → BALANCED" : "Measured 0 — wrong";
      console.log("Step", step, "State:", state);
    }
  }

  return { step, label, passed, expected, actual };
}