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
const labels: Record<string, string> = {
  "default": "Default State",
  "prep": "Initial State",
  "superpos": "Superposition",
  "oracle": "Oracle",
  "finalh": "Final Hadamard",
  "meas": "Measurement",
};

export function verifyDeutschStep(
  step: number,
  state: Qubit,
  fn: DeutschFunction
): VerificationResult | null {
  // diff oracle length for f2 kase zi>cnot>zi
  const oraclef2 = (fn === "f2") ? 3 : 1;

  const prep_step = 1;
  const superpos_step = 2;
  const oracle_step = 3 + oraclef2;
  const finalh_step = oracle_step + 2;
  const meas_step = oracle_step + 3;

  let phase = "";
  if (step === 0) {
    phase = "default";
  } else if (step === prep_step) {
    phase = "prep";
  } else if (step === superpos_step) {
    phase = "superpos";
  } else if (step === oracle_step) {
    phase = "oracle";
  } else if (step === finalh_step) {
    phase = "finalh";
  } else if (step === meas_step) {
    phase = "meas";
  } else return null;

  const label = labels[phase];
  let passed = false;
  let actual = "";
  let expected = "";
  
  if (phase === "default") {
    expected = "|0⟩|0⟩";
    passed = approx(Math.abs(amp(state, 0)), 1.0);
    actual = passed ? "|0⟩|0⟩" : "Not default state";
  } else if (phase === "prep") {
    expected = "|0⟩|1⟩";
    passed = approx(Math.abs(amp(state, 2)), 1.0); // |01> is decimal index 1
    actual = passed ? "|0⟩|1⟩" : "Incorrect initial state";
  } else if (phase === "superpos") {
    expected = "(|0⟩ + |1⟩)/√2 ⊗ |−⟩";
    passed = [0, 1, 2, 3].every(i => approx(Math.abs(amp(state, i)), 0.5));
    actual = passed ? "(|0⟩ + |1⟩)/√2 ⊗ |−⟩" : "Not in superposition";
  }
  else if (phase === "oracle") {
    if (fn === "f0") {
      expected = "|+⟩|−⟩";
      passed = 
        approx(amp(state, 0), 0.5) && 
        approx(amp(state, 1), 0.5) && 
        approx(amp(state, 2), -0.5) && 
        approx(amp(state, 3), -0.5);
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (fn === "f3") {
      // |+⟩|−⟩: [0.5, 0.5, 0.5, 0.5]
      expected = "|+⟩|−⟩";
      passed =
        approx(amp(state, 0), 0.5) &&
        approx(amp(state, 1), 0.5) &&
        approx(amp(state, 2), 0.5) &&
        approx(amp(state, 3), 0.5);
      actual = passed ? "|+⟩|−⟩ confirmed" : "Oracle output mismatch";
      console.log("Step", step, "State:", state);
    } else {
      expected = "|-⟩|−⟩";
      passed = 
        approx(amp(state, 0), 0.5) && 
        approx(amp(state, 1), -0.5) && 
        approx(amp(state, 2), -0.5) && 
        approx(amp(state, 3), 0.5);
      actual = passed ? "|−⟩|−⟩" : "Oracle mismatch";
    }
  } else if (phase === "finalh") {
    if (fn === "f0") {
      expected = "State |0⟩";
      passed = 
      approx(amp(state, 0), Math.sqrt(0.5)) && 
      approx(amp(state, 2), -Math.sqrt(0.5));
      actual = passed ? "State |0⟩" : "Mismatch";
    } if (fn === "f3") {
      expected = "State |0⟩";
      passed = 
      approx(amp(state, 0), Math.sqrt(0.5)) && 
      approx(amp(state, 2), Math.sqrt(0.5));
      actual = passed ? "State |0⟩" : "Mismatch";
    } else {
      expected = "State |1⟩";
      passed = 
        approx(amp(state, 1), Math.sqrt(0.5)) &&
        approx(amp(state, 3), -Math.sqrt(0.5));
      actual = passed ? "State |1⟩" : "Mismatch";
    }
  } else if (phase === "meas") {
    let max = 0;
    for (let i = 0; i < state.length; i++) {
      if (Math.abs(state[i]) > Math.abs(state[max])) max = i;
    }
    if (fn === "f0" || fn === "f3") { 
      expected = "f(0) ⊕ f(1) = 0 (Constant)";
      passed = max === 0 || max === 2;
      actual = passed ? "f(0) ⊕ f(1) = 0" : "Incorrect Measurement";
    } else {
      expected = "f(0) ⊕ f(1) = 1 (Balanced)";
      passed = max === 1 || max === 3;
      actual = passed ? "f(0) ⊕ f(1) = 1" : "Incorrect Measurement";
    }
  }
  const logicalStepNum = {
    "default": 0,
    "prep": 1,
    "superpos": 2,
    "oracle": 3,
    "finalh": 4,
    "meas": 5
  }[phase] ?? -1;

  return { step: logicalStepNum, label, passed, expected, actual };
}