import type { DeutschFunction } from "../verification/DeutschVerification";

export type ExplanationResult = {
  step: number;
  explanation: string;
};

const phaseLabels: Record<string, string> = {
  default: "Initially, states are |0⟩|0⟩. Barrier gates will be applied throughout the algorithm to separate pieces of the circuit properly.",
  prep: "Then, the initial states are prepared |0⟩ and |1⟩ by applying Pauli-X gate on the last qubit to flip the ancilla from |0⟩ to |1⟩. ",
  superpos: "Hadamard gates are applied on both qubits, creating a superposition and allowing the algorithm to evaluate all possible inputs simultaneously enabling quantum parallelism. Each of the states will now have equal value.",
};

const oracleExplanations: Record<DeutschFunction, string> = {
  f0: "The oracle Uf implements f0 by applying Identity gates on both qubits, leaving the states unchanged.",
  f1: "The oracle Uf implements f1 by applying a CNOT gate, which creates entanglement between the qubits, correlating their states in a way that is crucial for distinguishing balanced functions from constant ones. The control is the first qubit and the target is the second qubit.",
  f2: "The oracle Uf implements f2 by applying a Z gate on the first qubit and Identity gate on the second qubit, followed by a CNOT gate, then another Z gate on the first qubit and Identity gate on the second qubit. The Z gates flip the phase of the qubit without creating entanglement, while the CNOT gate generates entanglement between the qubits.",
  f3: "The oracle Uf implements f3 by applying an Identity gate on the first qubit and a Z gate on the second qubit. The first qubit is left unchanged, no entanglement occurs, and the qubits remain separable.",
};

const finalHExplanations: Record<DeutschFunction, string> = {
  f0: "A Hadamard gate will be applied again to the first qubit to extract the result, while the Identity or Hadamard gate on the second qubit is optional and retained only for circuit symmetry and analytical clarity.",
  f1: "A Hadamard gate will be applied again to the first qubit to extract the result, while the Identity or Hadamard gate on the second qubit is optional and retained only for circuit symmetry and analytical clarity.",
  f2: "A Hadamard gate will be applied again to the first qubit to extract the result, while the Identity or Hadamard gate on the second qubit is optional and retained only for circuit symmetry and analytical clarity.",
  f3: "A Hadamard gate will be applied again to the first qubit to extract the result, while the Identity or Hadamard gate on the second qubit is optional and retained only for circuit symmetry and analytical clarity.",
};

const measurementExplanations: Record<DeutschFunction, string> = {
  f0: "Measuring the first qubit yields |0⟩ — f0 is Constant. The application of Identity gates left the states unchanged.",
  f1: "Measuring the first qubit yields |1⟩ — f1 is Balanced. The CNOT gate created entanglement between the qubits.",
  f2: "Measuring the first qubit yields |1⟩ — f2 is Balanced. The phase flips from the Pauli-Z gates and CNOT gate creating entanglement",
  f3: "Measuring the first qubit yields |0⟩ — f3 is Constant. The Pauli-Z gate on the second qubit affects the phase but does not create entanglement.",
};

export function explainDeutschStep( step: number, fn: DeutschFunction ): ExplanationResult | null {
  const oraclef2 = fn === "f2" ? 3 : 1;
  const prep_step = 1;
  const superpos_step = 2;
  const oracle_end_step = 3 + oraclef2;
  const finalh_step = oracle_end_step + 2;
  const meas_step = oracle_end_step + 3;

  let phase = "";
  let explanation = "";

  if (step === 0) {
    phase = "default";
    explanation = phaseLabels[phase];
  } else if (step === prep_step) {
    phase = "prep";
    explanation = phaseLabels[phase];
  } else if (step === superpos_step) {
    phase = "superpos";
    explanation = phaseLabels[phase];
  } else if ( step === oracle_end_step || (fn === "f2" && (step === 4 || step === 5))) {
    phase = "oracle";
    explanation = oracleExplanations[fn];
  } else if (step === finalh_step) {
    phase = "finalh";
    explanation = finalHExplanations[fn];
  } else if (step === meas_step) {
    phase = "meas";
    explanation = measurementExplanations[fn];
  } else {
    return null;
  }

  const logicalStepNum: Record<string, number> = {
    default: 0,
    prep: 1,
    superpos: 2,
    oracle: 3,
    finalh: 4,
    meas: 5,
  };

  return { 
    step: logicalStepNum[phase],
    explanation
  };
}