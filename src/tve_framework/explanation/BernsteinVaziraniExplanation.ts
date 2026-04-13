export type ExplanationResult = {
  step: number;
  explanation: string;
};

export function explainBernsteinVaziraniStep(step: number): ExplanationResult | null {
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
  } else if (step >= oracle_step_1 && step <= oracle_step_1_end) {
    phase = "o1";
  } else if (step >= oracle_step_2 && step <= oracle_step_2_end) {
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

  const measExplanations: Record<number, string> = {
    [meas_start]: "Measurement begins. q[0] is measured — this reveals the first bit of the hidden string s. The result is deterministic because the final Hadamard transformed the phase encoding directly into a computational basis state.",
    [meas_start + 1]: "q[1] is measured — this reveals the second bit of the hidden string s. Each measurement collapses one qubit, reading out one bit of s with certainty.",
    [meas_start + 2]: "q[2] is measured — this reveals the third bit of the hidden string s. The superposition has been fully converted into a single deterministic outcome by the oracle and final Hadamard.",
    [meas_end]: "q[3] is measured — this reveals the final bit of the hidden string s = 1101. All four bits are now known. Unlike classical algorithms that require n queries, the Bernstein–Vazirani algorithm discovers the entire string in a single oracle query.",
  };

  let explanation = "";
  if (step === oracle_step_1) {
    explanation = "The oracle Uf begins encoding the hidden string s = 1011. A CNOT gate is applied from q[0] — the first input qubit whose corresponding bit is 1 — targeting the auxiliary qubit. This encodes the first bit of s into the phase through phase kickback.";
  } else if (step === oracle_step_2) {
    explanation = "The oracle continues encoding s = 1011. A CNOT gate is applied from q[2], the third input qubit whose bit is 1, targeting the auxiliary qubit. Combined with the previous step, this now encodes 1010 into the phase.";
  } else if (step === oracle_step_3) {
    explanation = "The oracle completes encoding s = 1011. A CNOT gate is applied from q[3], the fourth input qubit whose bit is 1, targeting the auxiliary qubit. The oracle conditionally flips the auxiliary qubit through CNOT gates only for input qubits xi where si = 1 — blank indicates 0.";
  } else if (step >= meas_start && step <= meas_end) {
    explanation = measExplanations[step] ?? "";
  } else {
    const explanations: Record<string, string> = {
      default: "The circuit is empty. The initial state preparation sets the first n input qubits (q[0] to q[3]) to |0⟩ and the last qubit, the auxiliary qubit (q[4]), to |1⟩. Barrier gates will be applied throughout the algorithm to separate pieces of the circuit properly.",
      prep: "A Pauli-X gate is applied on the last qubit (q[4]) to flip the ancilla from |0⟩ to |1⟩ before creating the |−⟩ state. This sets up the auxiliary qubit so that the oracle can encode the hidden string s into the phase through phase kickback.",
      superpos: "Hadamard gates are applied to all input qubits (q[0] to q[3]), creating a superposition of all 16 possible 4-bit input strings from |0000⟩ to |1111⟩. This demonstrates quantum parallelism — the circuit evaluates all possible inputs x simultaneously.",
      o1: "The oracle Uf is encoding the hidden string s = 1011. The CNOT from q[0] has been applied — the auxiliary qubit is being flipped conditionally for each input qubit xi where si = 1.",
      o2: "The oracle Uf continues encoding s = 1011. The CNOT from q[2] has been applied — two bits of the hidden string are now encoded into the phase.",
      o3: "The oracle Uf has completed encoding s = 1011. The CNOT from q[3] has been applied — all three set bits of the hidden string are fully encoded into the phase through phase kickback.",
      finalh: "The final Hadamard gates are applied again to the first n input qubits (q[0] to q[3]), transforming the phase information encoded by the oracle into basis states that correspond exactly to the hidden string s. An Identity gate is applied on the last qubit for clarity.",
      meas: "Measuring the first n qubits (q[0] to q[3]) deterministically reveals the hidden string s = 1011. Unlike classical algorithms that would require n queries to determine s one bit at a time, the Bernstein–Vazirani algorithm discovers the entire string in a single query.",
    };
    explanation = explanations[phase] ?? "";
  }

  const logicalStepNum: Record<string, number> = {
    default: 0,
    prep: 1,
    superpos: 2,
    o1: 3,
    o2: 3,
    o3: 3,
    finalh: 4,
    meas: 5,
  };

  return {
    step: logicalStepNum[phase],
    explanation,
  };
}