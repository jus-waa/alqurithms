import type { Qubit } from "../../engine/qubit/Qubit";
import { computeFidelity, fidelityPercent } from "../../utils/fidelity";

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

export function approx(a: number, b: number) {
  return Math.abs(a - b) < fpc;
}

export function amp(state: Qubit, i: number): number {
  const stateVal = state[i];
  return (typeof stateVal === "number") ? stateVal : (stateVal as [number, number])[0];
}

const labels: Record<string, string> = {
  "default": "Initial State",
  "prep": "Preparation",
  "superpos": "Superposition",
  "oracle": "Oracle",
  "finalh": "Final Hadamard",
  "meas": "Measurement",
};

const deutschFidelityHistory: {
  step: number;
  phase: string;
  fidelity: number;
  fidelityText: string;
}[] = [];

function saveDeutschFidelity(step: number, phase: string, fidelityValue: number) {
  const entry = {
    step,
    phase,
    fidelity: fidelityValue,
    fidelityText: fidelityPercent(fidelityValue),
  };

  const existingIndex = deutschFidelityHistory.findIndex(
    (item) => item.step === step && item.phase === phase
  );

  if (existingIndex >= 0) {
    deutschFidelityHistory[existingIndex] = entry;
  } else {
    deutschFidelityHistory.push(entry);
  }
}

function getExpectedDeutschState(phase: string, fn: DeutschFunction, step: number): number[] | null {
  if (phase === "default") return [1, 0, 0, 0];

  if (phase === "prep") return [0, 0, 1, 0]; // little endian

  if (phase === "superpos") return [0.5, 0.5, 0.5, 0.5];

  if (phase === "oracle") {
    if (fn === "f0") return [0.5, 0.5, -0.5, -0.5];
    if (fn === "f1") return [0.5, -0.5, -0.5, 0.5];

    if (fn === "f2") {
      if (step === 4) return [0.5, -0.5, -0.5, 0.5];
      if (step === 5) return [0.5, 0.5, -0.5, -0.5];
      return [0.5, -0.5, -0.5, 0.5];
    }

    if (fn === "f3") return [0.5, 0.5, 0.5, 0.5];
  }

  if (phase === "finalh") {
    if (fn === "f0") return [Math.sqrt(0.5), 0, -Math.sqrt(0.5), 0];
    if (fn === "f3") return [Math.sqrt(0.5), 0, Math.sqrt(0.5), 0];
    return [0, Math.sqrt(0.5), 0, -Math.sqrt(0.5)];
  }

  return null;
}

export function verifyDeutschStep(
  step: number,
  state: Qubit,
  fn: DeutschFunction
): VerificationResult | null {
  
  const oraclef2 = (fn === "f2") ? 3 : 1;
  const prep_step = 1;
  const superpos_step = 2;
  const oracle_end_step = 3 + oraclef2; // step 6 for f2 step 4 for f0 f1 f3
  const finalh_step = oracle_end_step + 2; // Step 8 for f2 step 6 for f0 f1 f3
  const meas_step = oracle_end_step + 3; // step 9 for f2 step 7 for f0 f1 f3

  let phase = "";
  if (step === 0) {
    phase = "default";
  } else if (step === prep_step) {
    phase = "prep";
  } else if (step === superpos_step) {
    phase = "superpos";
  } else if (step === oracle_end_step || (fn === "f2" && (step === 4 || step === 5))) {
    phase = "oracle";
  } else if (step === finalh_step) {
    phase = "finalh";
  } else if (step === meas_step) {
    phase = "meas";
  } else {
    // barrier gaps step 3 and 7
    return null;
  }

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
    expected = "Equal position on all states";
    passed = [0, 1, 2, 3].every(i => approx(Math.abs(amp(state, i)), 0.5));
    actual = passed ? "Equal position on all states" : "Not in superposition";
  } else if (phase === "oracle") {
    if (fn === "f2" && step === 4) {
      expected = "|-⟩|−⟩";
      passed = 
        approx(amp(state, 0), 0.5) && 
        approx(amp(state, 1), -0.5) && 
        approx(amp(state, 2), -0.5) && 
        approx(amp(state, 3), 0.5);
      actual = passed ? "|−⟩|−⟩" : "Oracle mismatch";
    } else if (fn === "f2" && step === 5) {
      expected = "|-⟩|−⟩";
      passed = 
        approx(amp(state, 0), 0.5) && 
        approx(amp(state, 1), 0.5) && 
        approx(amp(state, 2), -0.5) && 
        approx(amp(state, 3), -0.5);
      // FIXED label to reflect actual state
      actual = passed ? "|−⟩|−⟩" : "Oracle mismatch";
    } else if (step === oracle_end_step) {
      if (fn === "f0") {
        expected = "|+⟩|−⟩";
        passed = 
          approx(amp(state, 0), 0.5) && 
          approx(amp(state, 1), 0.5) && 
          approx(amp(state, 2), -0.5) && 
          approx(amp(state, 3), -0.5);
        actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
      } else if (fn === "f3") {
        expected = "|+⟩|−⟩";
        passed =
          approx(amp(state, 0), 0.5) &&
          approx(amp(state, 1), 0.5) &&
          approx(amp(state, 2), 0.5) &&
          approx(amp(state, 3), 0.5);
        actual = passed ? "|+⟩|−⟩ confirmed" : "Oracle mismatch";
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
    }
  } else if (phase === "finalh") {
    if (fn === "f0") {
      expected = "First qubit - State |0⟩";
      passed = 
      approx(amp(state, 0), Math.sqrt(0.5)) && 
      approx(amp(state, 2), -Math.sqrt(0.5));
      actual = passed ? "State |0⟩" : "Mismatch";
    } else if (fn === "f3") {
      expected = "First qubit - State |0⟩";
      passed = 
      approx(amp(state, 0), Math.sqrt(0.5)) && 
      approx(amp(state, 2), Math.sqrt(0.5));
      actual = passed ? "State |0⟩" : "Mismatch";
    } else {
      expected = "First qubit - State |1⟩";
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
    console.log("=== Deutsch Fidelity Summary ===");
    console.table(deutschFidelityHistory);

    const lastEntry = deutschFidelityHistory[deutschFidelityHistory.length - 1];

    if (lastEntry) {
      console.log(
        `Final Fidelity (${lastEntry.phase}): ${lastEntry.fidelityText}`
      );
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
  
    // === FIDELITY LOGGING ===
  const expectedVec = getExpectedDeutschState(phase, fn, step);

  if (expectedVec) {
    const actualVec = [
      amp(state, 0),
      amp(state, 1),
      amp(state, 2),
      amp(state, 3),
    ];

    const F = computeFidelity(actualVec, expectedVec);

    saveDeutschFidelity(step, phase, F);

    console.log(
      `Deutsch Step ${step} Fidelity: ${fidelityPercent(F)}`
    );
  }

  return { step: logicalStepNum, label, passed, expected, actual };
}