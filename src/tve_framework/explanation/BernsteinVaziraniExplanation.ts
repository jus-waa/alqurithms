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
    [meas_start]: "Measurement begins. q[0] is measured revealing the first bit of the hidden string s |00001⟩. ",
    [meas_start + 1]: "Then, q[1] is measured, revealing the second bit of the hidden string s |00001. This is unchanged because a CNOT gate was not applied for this qubit.",
    [meas_start + 2]: "Then, q[2] is measured, revealing the third bit of the hidden string s |00101⟩.",
    [meas_end]: "Then, q[3] is measured revealing the final bit of the hidden string s = 1011. All four bits are now known. ",
  };

  let explanation = "";
  if (step === oracle_step_1) {
    explanation = "The oracle Uf begins encoding the hidden string s = 1011. A CNOT gate is applied where control is q[0] the first input qubit whose corresponding bit is 1, the target q[1]. This will be equal to 1000 when measured.";
  } else if (step === oracle_step_2) {
    explanation = "The oracle continues encoding s = 1011. Another CNOT gate is applied where control is q[2] whose corresponding bit is 1, the target q[1]. This will be equal to 1010 when measured.";
  } else if (step === oracle_step_3) {
    explanation = "The oracle completes encoding s = 1011. Another CNOT gate is applied where control is q[2] whose corresponding bit is 1, the target q[1]. This will be equal to 1011 when measured.";
  } else if (step >= meas_start && step <= meas_end) {
    explanation = measExplanations[step] ?? "";
  } else {
    const explanations: Record<string, string> = {
      default: "Initially, states are |0⟩|0⟩|0⟩|0⟩|0⟩. Barrier gates will be applied throughout the algorithm to separate pieces of the circuit properly.",
      prep: "Then, the preparation of initial states will set up the first n input qubits to |0⟩ and the last qubit known as auxiliary qubit, to |1⟩ by applying a Pauli-X gate on it, flipping the ancilla from |0⟩ to |1⟩ before creating the |−⟩ state.",
      superpos: "Hadamard gates are applied to all input qubits (q[0] to q[3]), creating a superposition of all 16 possible 4-bit input strings from |0000⟩ to |1111⟩, demonstrating quantum parallelism as the circuit evaluates all possible inputs x simultaneously.",
      o1: "The oracle Uf begins encoding the hidden string s = 1011. A CNOT gate is applied where control is q[0] the first input qubit whose corresponding bit is 1, the target q[1]. This will be equal to 1000 when measured.",
      o2: "The oracle continues encoding s = 1011. Another CNOT gate is applied where control is q[2] whose corresponding bit is 1, the target q[1]. This will be equal to 1010 when measured.",
      o3: "The oracle completes encoding s = 1011. Another CNOT gate is applied where control is q[2] whose corresponding bit is 1, the target q[1]. This will be equal to 1011 when measured.",
      finalh: "The final Hadamard gates are applied again to the first n input qubits (q[0] to q[3]), transforming the phase information encoded by the oracle into basis states that correspond exactly to the hidden string s. An Identity gate is applied on the last qubit for clarity.",
      meas: "Measuring the first n qubits (q[0] to q[3]) deterministically reveals the hidden string s = 1011. Unlike classical algorithms that would require n queries to determine s one bit at a time, the Bernstein-Vazirani algorithm discovers the entire string in a single query.",
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