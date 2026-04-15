import type { Qubit } from "../../engine/qubit/Qubit";
import { approx } from "./DeutschVerification";
import { amp } from "./DeutschVerification";

import { computeFidelity, fidelityPercent } from "../../utils/fidelity";

export type VerificationResult = {
  step: number;
  label: string;
  passed: boolean;
  expected: string;
  actual: string;
};

const labels: Record<string, string> = {
  "default": "Default State",
  "prep": "Initial State Preparation",
  "superpos": "Superposition",
  "oracle": "Oracle (Function s·x)",
  "finalh": "Final Hadamard",
  "meas": "Measurement",
};

const bernsteinFidelityHistory: {
  step: number;
  phase: string;
  fidelity: number;
  fidelityText: string;
}[] = [];

function saveBernsteinFidelity(step: number, phase: string, fidelityValue: number) {
  const entry = {
    step,
    phase,
    fidelity: fidelityValue,
    fidelityText: fidelityPercent(fidelityValue),
  };

  const existingIndex = bernsteinFidelityHistory.findIndex(
    (item) => item.step === step && item.phase === phase
  );

  if (existingIndex >= 0) {
    bernsteinFidelityHistory[existingIndex] = entry;
  } else {
    bernsteinFidelityHistory.push(entry);
  }
}

function getExpectedBernsteinState(
  phase: string,
  step: number,
  secretString: string
): number[] | null {
  if (phase === "default") {
    return Array.from({ length: 32 }, (_, i) => (i === 0 ? 1 : 0));
  }

  if (phase === "prep") {
    return Array.from({ length: 32 }, (_, i) => (i === 16 ? 1 : 0));
  }

  if (phase === "superpos") {
    return Array.from({ length: 32 }, (_, i) => {
      if (i < 16) return 0;
      return i % 2 === 0 ? 0.177 : -0.177;
    });
  }

  if (phase === "oracle") {
    if (step === 4) {
      return Array.from({ length: 32 }, (_, i) => {
        const base = i % 2 === 0 ? 0.177 : -0.177;
        const flip = Math.floor(i / 16) % 2 === 1;
        return flip ? -base : base;
      });
    }

    if (step === 6) {
      return Array.from({ length: 32 }, (_, i) => {
        const base = i % 2 === 0 ? 0.177 : -0.177;
        const group = Math.floor(i / 4);
        const flip = group < 4 ? group % 2 === 1 : group % 2 === 0;
        return flip ? -base : base;
      });
    }

    if (step === 8) {
      const flipGroups = [0, 1, 1, 0, 1, 0, 0, 1];
      return Array.from({ length: 32 }, (_, i) => {
        const base = i % 2 === 0 ? 0.177 : -0.177;
        const flip = flipGroups[Math.floor(i / 4)] === 1;
        return flip ? -base : base;
      });
    }

    return null;
  }

  if (phase === "finalh") {
    return Array.from({ length: 32 }, (_, i) => {
      if (i === 13) return Math.sqrt(0.5);
      if (i === 29) return -Math.sqrt(0.5);
      return 0;
    });
  }

  if (phase === "meas") {
    return null;
  }

  return null;
}

export function verifyBernsteinVaziraniStep(
  step: number,
  state: Qubit,
  secretString: string // "1101"
): VerificationResult | null {
  
  // Step indices based on standard BV structure
  const prep_step = 1;
  const superpos_step = 2;
  const oracle_start = 4;
  const oracle_end = 8; 
  const finalh_step = oracle_end + 1;
  const meas_start = finalh_step + 1;
  const meas_end = meas_start + 3; 

  let phase = "";
  if (step === 0) phase = "default";
  else if (step === prep_step) phase = "prep";
  else if (step === superpos_step) phase = "superpos";
  else if (step >= oracle_start && step <= oracle_end) phase = "oracle";
  else if (step === finalh_step) phase = "finalh";
  else if (step >= meas_start && step <= meas_end) phase = "meas";
  else return null;

  const label = labels[phase];
  let passed = false;
  let actual = "";
  let expected = "";

  if (phase === "default") {
    expected = "|00000⟩";
    passed = approx(Math.abs(amp(state, 0)), 1.0);
    actual = passed ? "|00000⟩" : "Not default state";
  } else if (phase === "prep") {
    expected = "Ancilla to |1⟩";
    passed = approx(Math.abs(amp(state, 16)), 1.0);
    actual = passed ? "|10000⟩" : "Initial prep failed";
  } else if (phase === "superpos") {
    expected = "All states 3.125%";
    passed = Array.from({ length: 16 }).every((_, i) => approx(Math.abs(amp(state, i + 16)), 0.177));
    actual = passed ? "Superposition active" : "Mismatch in superposition";
  } else if (phase === "oracle") {
    if (step === 4) {
      expected = "Oracle Phase";
      passed = Array.from({ length: 32}).every((_,i) => {
        const base = i % 2 === 0 ? 0.177 : -0.177;
        const flip = Math.floor(i / 16) % 2 === 1 ;
        return approx(amp(state, i), flip ? -base : base);
      });
      actual = passed ? "Oracle Correct" : "Oracle Mismatch";
    } else if (step === 6) {
      expected = "Oracle Phase";
      passed = Array.from({ length: 32 }).every((_, i) => {
        const base = i % 2 === 0 ? 0.177 : -0.177;
        const group = Math.floor(i / 4);
        const flip = group < 4
          ? group % 2 === 1
          : group % 2 === 0;
        return approx(amp(state, i), flip ? -base : base);
      });
      actual = passed ? "Oracle Correct" : "Oracle Mismatch";
    } else if (step === 8) {
      expected = "Oracle Phase";
      const flipGroups = [0,1,1,0,1,0,0,1];
      passed = Array.from({ length: 32 }).every((_, i) => {
        const base = i % 2 === 0 ? 0.177 : -0.177;
        const flip = flipGroups[Math.floor(i / 4)] === 1;
        return approx(amp(state, i), flip ? -base : base);
      });
      actual = passed ? "Oracle Correct" : "Oracle Mismatch";

    } else {
      expected = "Oracle Phase";
      passed = true;
      actual = passed ? "Oracle Correct" : "Oracle Mismatch";
    }
  } else if (phase === "finalh") {
    expected = "Final Hadamard";
    passed = 
    approx(amp(state, 13), Math.sqrt(0.5)) &&
    approx(amp(state, 29), -Math.sqrt(0.5)) ; 
    actual = passed ? "Hadamard state" : "Mismatch at Final Hadamard";
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

    if (step === meas_end) { 
      const measuredS = (maxIndex & 0xF).toString(2).padStart(4, '0');
      passed = measuredS === secretString;
      expected = `Secret String: ${secretString}`;
      actual = passed
        ? `Found s = ${measuredS}`
        : `Found s = ${measuredS} (Wrong)`;
    } else if (step === meas_start) { 
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
    } else {
      passed = false;
      expected = "Unknown measurement step";
      actual = `Step ${step} not defined (Failed)`;
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

  const expectedVec = getExpectedBernsteinState(phase, step, secretString);

  if (expectedVec) {
    const actualVec = Array.from({ length: 32 }, (_, i) => amp(state, i));
    const F = computeFidelity(actualVec, expectedVec);

    saveBernsteinFidelity(step, phase, F);

    console.log(
      `Bernstein-Vazirani Step ${step} Fidelity: ${fidelityPercent(F)}`
    );
  }

  if (phase === "meas" && step === meas_end) {
    console.log("=== Bernstein-Vazirani Fidelity Summary ===");
    console.table(bernsteinFidelityHistory);

    const lastEntry = bernsteinFidelityHistory[bernsteinFidelityHistory.length - 1];

    if (lastEntry) {
      console.log(
        `Final Fidelity (${lastEntry.phase}): ${lastEntry.fidelityText}`
      );
    }
  }

  return { step: logicalStepNum, label, passed, expected, actual };
}