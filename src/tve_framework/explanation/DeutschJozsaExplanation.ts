export type ExplanationResult = {
  step: number;
  explanation: string;
};

export function explainDeutschJozsaStep( step: number ): ExplanationResult | null {
  const prep_step = 1;
  const superpos_step = 2;
  const oracle_step_1 = 4;
  const oracle_step_1_end = 7;
  const oracle_step_2 = 8;
  const oracle_step_2_end = 11;
  const oracle_step_3 = 12;
  const oracle_step_3_end = 15;
  const oracle_step_4 = 16;
  const oracle_step_4_end = 17;
  const finalh_step = oracle_step_4 + 2;
  const meas_start = finalh_step + 1;
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
  } else {
    return null;
  }

  const measExplanations: Record<number, string> = {
    [meas_start]:     "Measurement begins. q[0] is measured first, collapsing the first qubit. For a balanced function, this result will be non-zero — the interference pattern ensures at least one input qubit measures as |1⟩.",
    [meas_start + 1]: "q[1] is measured, collapsing the second qubit. The combined result of q[0] and q[1] continues to reveal the balanced nature of the function through the interference pattern created by the final Hadamard.",
    [meas_end]:       "q[2] is measured — all three input qubits are now measured. A non-zero result confirms the function is balanced. Using f(x) = 1 for x ∈ {001, 011, 110, 111}, the measurement yields a non-zero bitstring, ruling out a constant function which would have produced |000⟩ with certainty.",
  };

  const explanations: Record<string, string> = {
    default: "The circuit is empty. The initial state preparation sets the first n qubits (q[0] to q[2]) to |0⟩⊗n and the last qubit, the auxiliary qubit (q[3]), to |1⟩. Barrier gates will be applied throughout the algorithm to separate pieces of the circuit properly.",
    prep: "A Pauli-X gate is applied on the last qubit (q[3]) to flip the ancilla from |0⟩ to |1⟩ before creating the |−⟩ state. This prepares the auxiliary qubit so that the oracle can encode f(x) into the phase.",
    superpos: "Hadamard gates are applied to all qubits, creating a superposition of all 8 possible 3-bit input strings from |000⟩ to |111⟩. This allows the algorithm to evaluate all possible inputs simultaneously — quantum parallelism. Each of the states will now have equal amplitude.",
    oracle_1: "The oracle Uf is being applied for input 001. Pauli-X gates are applied on q[0] and q[1] to select this input, followed by a Toffoli gate that conditionally flips the auxiliary qubit since f(001) = 1, then Pauli-X gates on the same qubits to restore them. The oracle conditionally flips the auxiliary qubit for each input where f(x) = 1.",
    oracle_2: "The oracle Uf is being applied for input 011. A Pauli-X gate is applied on q[0] to select this input, followed by a Toffoli gate that conditionally flips the auxiliary qubit since f(011) = 1, then another Pauli-X gate on the same qubit to restore it.",
    oracle_3: "The oracle Uf is being applied for input 110. A Pauli-X gate is applied on q[2] to select this input, followed by a Toffoli gate that conditionally flips the auxiliary qubit since f(110) = 1, then another Pauli-X gate on the same qubit to restore it.",
    oracle_4: "The oracle Uf is being applied for input 111. A Toffoli gate is applied directly since all input qubits are already |1⟩, conditionally flipping the auxiliary qubit since f(111) = 1. No Pauli-X gates are needed as no bits need to be flipped for this input.",
    finalh: "The final Hadamard gates are applied to the first n qubits (q[0] to q[2]), transforming the phase information encoded by the oracle into measurable computational basis states. This is the interference step that concentrates the probability into states that reveal the function's nature.",
    meas: "Measuring the first n qubits (q[0] to q[2]) deterministically reveals whether the function is constant or balanced. Using the sample function f(x) = 1 for x ∈ {001, 011, 110, 111} and f(x) = 0 for x ∈ {000, 010, 100, 101}, the measurement result indicates that the function is balanced — a constant function would have yielded |000⟩ with certainty.",
  
  };

  const logicalStepNum: Record<string, number> = {
    default: 0,
    prep: 1,
    superpos: 2,
    oracle_1: 3,
    oracle_2: 3,
    oracle_3: 3,
    oracle_4: 3,
    finalh: 4,
    meas: 5,
  };

  return {
    step: logicalStepNum[phase],
    explanation: phase === "meas"
      ? (measExplanations[step] ?? "")
      : (explanations[phase] ?? ""),
  };
}