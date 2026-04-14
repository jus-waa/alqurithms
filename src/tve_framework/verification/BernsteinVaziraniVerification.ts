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

const labels: Record<string, string> = {
  "default": "Initial State",
  "prep": "Preparation",
  "superpos": "Superposition",
  "o1": "Oracle (s[0] = 1)",
  "o2": "Oracle (s[2] = 1)",
  "o3": "Oracle (s[3] = 1)",
  "finalh": "Final Hadamard",
  "meas": "Measurement",
};

export function verifyBernsteinVaziraniStep(
  step: number,
  state: Qubit,
  secretString: string // "1011"
): VerificationResult | null {

  const prep_step = 1;
  const superpos_step = 2;
  const oracle_step_1 = 4;
  const oracle_step_1_end = 6;
  const oracle_step_2 = 6;
  const oracle_step_2_end = 8;
  const oracle_step_3 = 8;
  const oracle_step_3_end = 9;
  const finalh_step = oracle_step_3_end + 1;
  const meas_start = finalh_step + 1;
  const meas_end = meas_start + 3;

  let phase = "";
  if (step === 0) {
  phase = "default";
} else if (step === prep_step) {
  phase = "prep";
} else if (step === superpos_step) {
  phase = "superpos";
} else if (step >= oracle_step_1 && step < oracle_step_1_end) {
  phase = "o1";
} else if (step >= oracle_step_2 && step < oracle_step_2_end) {
  phase = "o2";
} else if (step >= oracle_step_3 && step <= oracle_step_3_end) {
  phase = "o3";
} else if (step === finalh_step) {
  phase = "finalh";
} else if (step >= meas_start && step <= meas_end) {
  phase = "meas";
} else {
  return null;
}

  const label = labels[phase];
  let passed = false;
  let actual = "";
  let expected = "";

  if (phase === "default") {
    expected = "|0⟩|0⟩|0⟩|0⟩|0⟩";
    passed = approx(Math.abs(amp(state, 0)), 1.0);
    actual = passed ? "|0⟩|0⟩|0⟩|0⟩|0⟩" : "Not default state";

  } else if (phase === "prep") {
    expected = "|0⟩|0⟩|0⟩|0⟩|1⟩";
    passed = approx(Math.abs(amp(state, 16)), 1.0);
    actual = passed ? "|0⟩|0⟩|0⟩|0⟩|1⟩" : "Initial prep failed";

  } else if (phase === "superpos") {
    expected = "Equal position on all states";
    passed = Array.from({ length: 16 }).every((_, i) =>
      approx(Math.abs(amp(state, i + 16)), 0.177)
    );
    actual = passed ? "Equal position on all states" : "Not in superposition";

  } else if (phase === "o1") {
    // After cx q[0], q[4]: s[0]=1, flip ancilla when q[0]=1
    expected = "Oracle Phase (s[0]=1)";
    passed = Array.from({ length: 32 }).every((_, i) => {
      const base = i % 2 === 0 ? 0.177 : -0.177;
      const flip = Math.floor(i / 16) % 2 === 1;
      return approx(amp(state, i), flip ? -base : base);
    });
    actual = passed ? "Oracle Correct" : "Oracle Mismatch";

  } else if (phase === "o2") {
    // After cx q[1], q[4]: s[1]=1, flip ancilla when q[1]=1
    expected = "Oracle Phase (s[2]=1)";
    passed = Array.from({ length: 32 }).every((_, i) => {
      const base = i % 2 === 0 ? 0.177 : -0.177;
      const group = Math.floor(i / 4);
      const flip = group < 4
        ? group % 2 === 1
        : group % 2 === 0;
      return approx(amp(state, i), flip ? -base : base);
    });
    actual = passed ? "Oracle Correct" : "Oracle Mismatch";

  } else if (phase === "o3") {
    // After cx q[3], q[4]: s[3]=1, flip ancilla when q[3]=1
    expected = "Oracle Phase (s[3]=1)";
    const flipGroups = [0, 1, 1, 0, 1, 0, 0, 1];
    passed = Array.from({ length: 32 }).every((_, i) => {
      const base = i % 2 === 0 ? 0.177 : -0.177;
      const flip = flipGroups[Math.floor(i / 4)] === 1;
      return approx(amp(state, i), flip ? -base : base);
    });
    actual = passed ? "Oracle Correct" : "Oracle Mismatch";

  } else if (phase === "finalh") {
    expected = "Final Hadamard";
    passed =
      approx(amp(state, 13), Math.sqrt(0.5)) &&
      approx(amp(state, 29), -Math.sqrt(0.5));
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

    const measuredBin = maxIndex.toString(2).padStart(5, '0');
    const isFull = Math.abs(maxProb - 1) < 1e-6;

    if (step === meas_start) {
      passed = maxIndex === 1 && isFull;
      expected = "Expected: |00001⟩ (100%)";
      actual = passed
        ? `Correct: |${measuredBin}⟩`
        : `Got: |${measuredBin}⟩ (${(maxProb * 100).toFixed(1)}%) (Wrong)`;
    } else if (step === meas_start + 1) {
      passed = maxIndex === 1 && isFull;
      expected = "Expected: |00001⟩ (100%)";
      actual = passed
        ? `Correct: |${measuredBin}⟩`
        : `Got: |${measuredBin}⟩ (${(maxProb * 100).toFixed(1)}%) (Wrong)`;
    } else if (step === meas_start + 2) {
      passed = maxIndex === 5 && isFull;
      expected = "Expected: |00101⟩ (100%)";
      actual = passed
        ? `Correct: |${measuredBin}⟩`
        : `Got: |${measuredBin}⟩ (${(maxProb * 100).toFixed(1)}%) (Wrong)`;
    } else if (step === meas_end) {
      expected = "Expected: |01101⟩ (100%)";
      passed = maxIndex === 13 && isFull;
      actual = passed
        ? `Found s = 1011`
        : `s mismatch`;
    } else {
      passed = false;
      expected = "Unknown measurement step";
      actual = `Step ${step} not defined (Failed)`;
    }
  }

  const logicalStepNum: Record<string, number> = {
    "default": 0,
    "prep": 1,
    "superpos": 2,
    "o1": 3,
    "o2": 3,
    "o3": 3,
    "finalh": 4,
    "meas": 5,
  };

  return { step: logicalStepNum[phase], label, passed, expected, actual };
}