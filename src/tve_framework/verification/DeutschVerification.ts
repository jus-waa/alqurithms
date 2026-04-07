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
  1: { 
    f0: "|0⟩|1⟩", 
    f1: "|0⟩|1⟩", 
    f2: "|0⟩|1⟩", 
    f3: "|0⟩|1⟩" 
  },
  2: { 
    f0: "(|0⟩ + |1⟩)/√2 ⊗ |−⟩", 
    f1: "(|0⟩ + |1⟩)/√2 ⊗ |−⟩", 
    f2: "(|0⟩ + |1⟩)/√2 ⊗ |−⟩", 
    f3: "(|0⟩ + |1⟩)/√2 ⊗ |−⟩" 
  },
  4: {
    f0: "|+⟩|−⟩", // two identity
    f1: "|−⟩|−⟩", // cnot
    f2: "|−⟩|−⟩", // z i, cnot, z i
    f3: "|+⟩|−⟩", // i z
  },  
  6: {
    f0: "|0⟩ on q0",
    f1: "|1⟩ on q0",
    f2: "|1⟩ on q0",
    f3: "|0⟩ on q0",
  },
  7: {
    f0: "Measure 0, results to constant",
    f1: "Measure 1, results to balanced",
    f2: "Measure 1, results to balanced",
    f3: "Measure 0, results to balanced",
  },
};

export function verifyDeutschStep(
  step: number,
  state: Qubit,
  fn: DeutschFunction
): VerificationResult | null {
  const label = (step === 1) ? "Initial State" : labels[step] ?? `Step ${step}`;
  const expected = (step === 1) ? "|0⟩|1⟩" : expectedState[step]?.[fn] ?? "—";
  let passed = false;
  let actual = "";
  
  // step 3,5 includes barrier kaya auto true nlng passed at actual === prev actual
  if (step === 3 || step === 5) return null;

  if (step === 1) {
    passed = approx(Math.abs(amp(state, 0)), 1.0);
    actual = passed ? "|0⟩|1⟩ confirmed" : "Unexpected initial state";
  } 
  else if (step === 2) {
    // All 4 must be in super pos
    const allSuper = [0, 1, 2, 3].every(i => approx(Math.abs(amp(state, i)), 0.5));
    passed = allSuper;
    actual = passed ? "Equal superposition confirmed" : "Not in superposition";
  } 
  else if (step === 4) {
    if (fn === "f0" || fn === "f3") {
      // |+⟩|−⟩: [0.5, -0.5, 0.5, -0.5]
      passed =
        approx(amp(state, 0), 0.5) &&
        approx(amp(state, 1), 0.5) &&
        approx(amp(state, 2), -0.5) &&
        approx(amp(state, 3), -0.5);
      actual = passed ? "|+⟩|−⟩ confirmed" : "Oracle output mismatch";
      console.log("Step", step, "State:", state);
    } else {
      // |−⟩|−⟩: [-0.5, 0.5, -0.5, 0.5] or similar sign variants
      passed =
        approx(amp(state, 0), 0.5) &&
        approx(amp(state, 1), -0.5) &&
        approx(amp(state, 2), -0.5) &&
        approx(amp(state, 3), 0.5);
      actual = passed ? "|−⟩|−⟩ confirmed" : "Oracle output mismatch";
      console.log("Step", step, "State:", state);
    }
  } 
  else if (step === 6) {
    if (fn === "f0" || fn === "f3") {
      passed =
        approx(amp(state, 0), Math.sqrt(0.5)) && //0.7071
        approx(amp(state, 1), 0) &&
        approx(amp(state, 2), -Math.sqrt(0.5)) &&
        approx(amp(state, 3), 0);
      actual = passed ? "|+⟩ state on q0" : "|-⟩ state on q0 — mismatch";
      console.log("Step", step, "State:", state);
    } else {
      passed =
        approx(amp(state, 0), 0) &&
        approx(amp(state, 1), Math.sqrt(0.5)) &&
        approx(amp(state, 2), 0) &&
        approx(amp(state, 3), -Math.sqrt(0.5));
      actual = passed ? "|-⟩ state on q0" : "|+⟩ state on q0 — mismatch";
      console.log("Step", step, "State:", state, "Actual:", actual);
    }
  } 
  else if (step === 7) {
    let max = 0;
    for (let i = 0; i < state.length; i++) {
      if (Math.abs(state[i]) > Math.abs(state[max])) {
        max = i;
      } 
    }
    if (fn === "f0" || fn === "f3") { 
      passed = max === 0 || max === 2;
      actual = passed ? "Measured 0 and is CONSTANT" : "Measured 1 — wrong";
      console.log("Step", step, "State:", state);
    } else {
      passed = max === 1 || max === 3;
      actual = passed ? "Measured 1 and is BALANCED" : "Measured 0 — wrong";
      console.log("Step", step, "State:", state);
    }
  }

  return { step, label, passed, expected, actual };
}