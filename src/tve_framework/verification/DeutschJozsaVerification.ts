import type { Qubit } from "../../engine/qubit/Qubit";

import { approx } from "./DeutschVerification";
import { amp } from "./DeutschVerification";

export type VerificationResult = {
  step: number;
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
};

// "" are for barriers
const labels: Record<string, string> = {
  "default": "Default State",
  "prep": "Initial State",
  "superpos": "Superposition",
  "oracle_1": "Oracle",
  "oracle_2": "Oracle",
  "oracle_3": "Oracle",
  "oracle_4": "Oracle",
  "finalh": "Final Hadamard",
  "meas": "Measurement",
};

export function verifyDeutschJozsaStep(
  step: number,
  state: Qubit,
): VerificationResult | null {

  const prep_step = 1;
  const superpos_step = 2;
  const oracle_step_1 = 3;
  const oracle_step_2 = 4;
  const oracle_step_3 = 5;
  const oracle_step_4 = 6;
  const finalh_step = oracle_step_4 + 2;
  const meas_step = oracle_step_4 + 3;

  let phase = "";
  if (step === 0) {
    phase = "default";
  } else if (step === prep_step) {
    phase = "prep";
  } else if (step === superpos_step) {
    phase = "superpos";
  } else if (step === oracle_step_1) {
    phase = "oracle_1";
  } else if (step === oracle_step_2) {
    phase = "oracle_2";
  } else if (step === oracle_step_3) {
    phase = "oracle_3";
  } else if (step === oracle_step_4) {
    phase = "oracle_4";
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
    passed = approx(Math.abs(amp(state, 8)), 1.0); 
    actual = passed ? "|0⟩|1⟩" : "Incorrect initial state";
  } else if (phase === "superpos") {
    expected = "Equal position on all states";
    passed = 
      [0, 1, 2, 3, 4, 5, 6 , 7, 8,
      9, 10, 11, 12, 13, 14, 15, 16].every(i => approx(Math.abs(amp(state, i)), 0.25));
    actual = passed ? "Equal position on all states" : "Not in superposition";
  }
  else if (phase === "oracle_1") {
      expected = "|+⟩|−⟩";
      passed = 
        approx(amp(state, 0), 0.5) && 
        approx(amp(state, 1), 0.5) && 
        approx(amp(state, 2), -0.5) && 
        approx(amp(state, 3), -0.5);
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
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