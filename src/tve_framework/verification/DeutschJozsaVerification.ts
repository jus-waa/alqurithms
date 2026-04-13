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
  const oracle_step_1 = 4;
  const oracle_step_1_end = 7; // 4
  const oracle_step_2 = 8;
  const oracle_step_2_end = 11; // 4
  const oracle_step_3 = 12;
  const oracle_step_3_end = 15; // 4
  const oracle_step_4 = 16;
  const oracle_step_4_end = 17; // 3
  const finalh_step = oracle_step_4 + 2;
  const meas_start = finalh_step + 1
  const meas_end = meas_start + 2;

  let phase = "";
  if (step === 0) {
    phase = "default";
  } else if (step === prep_step) {
    phase = "prep";
  } else if (step === superpos_step) {
    phase = "superpos";
  } else if (step >= oracle_step_1 && step < oracle_step_1_end) {
    phase = "oracle_1";
  } else if (step >= oracle_step_2 && step < oracle_step_2_end) {
    phase = "oracle_2";
  } else if (step >= oracle_step_3 && step < oracle_step_3_end) {
    phase = "oracle_3";
  } else if (step >= oracle_step_4 && step <= oracle_step_4_end) {
    phase = "oracle_4";
  } else if (step === finalh_step) {
    phase = "finalh";
  } else if (step >= meas_start && step <= meas_end) {
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
    passed = [0, 1, 2, 3, 4, 5, 6 , 7, 8, 9, 10, 11, 12, 13, 14, 15]
      .every(i => approx(Math.abs(amp(state, i)), 0.25));
    actual = passed ? "Equal position on all states" : "Not in superposition";
  } else if (phase === "oracle_1") {
    if (step === 4) {
      expected = "|+⟩|−⟩";
      passed = Array.from({ length: 8 }, (_, i) => i + 8).every(i => approx(amp(state, i), -0.25));
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 5) {
      expected = "|+⟩|−⟩";
      passed = Array.from({length: 16}).every((_, i) => {
        if (i >= 7 && i <= 14) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 6) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [4, 8, 9, 10, 11, 13, 14, 15];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } 
  } else if (phase === "oracle_2") {
    if (step === 8) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [5, 8, 9, 10, 11, 12, 14, 15];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 9) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [5, 7, 8, 9, 10, 11, 12, 14];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 10) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [4, 6, 8, 9, 10, 11, 13, 15];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    }
  } else if (phase === "oracle_3") {
    if (step === 12) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [0, 2, 9, 11, 12, 13, 14, 15];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 13) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [0, 2, 7, 9, 11, 12, 13, 14];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 14) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [3, 4, 6, 8, 9, 10, 13, 15];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    }
  } else if (phase === "oracle_4") {
    if (step === 16) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [3, 4, 6, 7, 8, 9, 10, 13];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } else if (step === 17) {
      expected = "|+⟩|−⟩";
      const negativeIndices = [3, 4, 6, 7, 8, 9, 10, 13];
      passed = Array.from({length: 16}).every((_, i) => {
        if (negativeIndices.includes(i)) {
          return approx(amp(state, i), -0.25);
        } else {
          return approx(amp(state, i), 0.25);
        }
      });      
      actual = passed ? "|+⟩|−⟩" : "Oracle mismatch";
    } 
  } else if (phase === "finalh") {
    expected = "Final Hadamard";
    const zeroIndices = [0, 1, 6, 7, 8, 9, 14, 15];
    const positiveIndices = [2, 4, 5, 11];
    const negativeIndices = [3, 10, 12, 13];

    passed = Array.from({ length: 16 }).every((_, i) => {
      if (zeroIndices.includes(i)) {
        return approx(amp(state, i), 0);
      } 
      else if (positiveIndices.includes(i)) {
        return approx(amp(state, i), 0.354);
      } 
      else if (negativeIndices.includes(i)) {
        return approx(amp(state, i), -0.354);
      }
      return false; 
    });
    actual = passed ? "Final Hadamard" : "Mismatch at Final Hadamard";
  } else if (phase === "meas") {
    let maxProb = 0;
    let maxIndex = 0;
      
    for (let i = 0; i < state.length; i++) {
      const probability = Math.pow(Math.abs(amp(state, i)), 2);
      if (probability > maxProb) {
        maxProb = probability;
        maxIndex = i;
      }
    }
    if (step === meas_start) {
      expected = "Measure q0 (~50% Prob)";
      passed = approx(maxProb, 0.50); 
      actual = passed ? "q0 sampled correctly (~50%)" : `q0 mismatch (got ${(maxProb * 100).toFixed(1)}%)`;
    } else if (step === meas_start + 1) {
      expected = "Measure q1 (~25% Prob)";
      passed = approx(maxProb, 0.25);
      actual = passed ? "q1 sampled correctly (~25%)" : `q1 mismatch (got ${(maxProb * 100).toFixed(1)}%)`;
    } else if (step === meas_end) {
      expected = "Final Output (~25% Prob)";
      passed = approx(maxProb, 0.25);
      if (passed) {
        const measuredStateWithoutAncilla = maxIndex >> 1; 
        if (measuredStateWithoutAncilla === 0) {
          actual = "Function is Constant (Measured |000⟩)";
        } else {
          const bitstring = maxIndex.toString(2).padStart(4, '0');
          actual = `Function is Balanced (Measured state |${bitstring}⟩)`;
        }
      } else {
        actual = `Final measurement mismatch (got ${(maxProb * 100).toFixed(1)}%)`;
      }
    }
  }
  const logicalStepNum = {
    "default": 0,
    "prep": 1,
    "superpos": 2,
    "oracle_1": 3,
    "oracle_2": 3,
    "oracle_3": 3,
    "oracle_4": 3,
    "finalh": 4,
    "meas": 5
  }[phase] ?? -1;

  return { step: logicalStepNum, label, passed, expected, actual };
}