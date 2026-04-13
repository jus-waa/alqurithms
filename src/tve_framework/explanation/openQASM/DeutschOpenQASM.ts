import type { DeutschFunction } from "../../verification/DeutschVerification";

export type OpenQASMResult = {
  step: number;
  openQASM: string;
};

const phaseLabels: Record<string, string> = {
  default: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n",
  prep: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n\nx q[1];",
  superpos: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n\nx q[1];\nh q[0];\nh q[1];\n"
};

const oracleQASM: Record<DeutschFunction, string> = {
  f0: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n\nx q[1];\nh q[0];\nh q[1];\n\n// Oracle f0 (constant 0)\nid q[0];\nid q[1];",
  f1: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n\nx q[1];\nh q[0];\nh q[1];\n\n// Oracle f1 (balanced)\ncx q[0], q[1];",
  f2: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n\nx q[1];\nh q[0];\nh q[1];\n\n// Oracle f2 (balanced)\nz q[0];\nid q[1];\ncx q[0], q[1];\nz q[0];\nid q[1];",
  f3: "OPENQASM 3;\n\nqubit[2] q;\nbit[2] c;\n\nx q[1];\nh q[0];\nh q[1];\n\n// Oracle f3 (constant 1)\nid q[0];\nz q[1];",
};

const finalHQASM: Record<DeutschFunction, string> = {
  f0: oracleQASM.f0 + "\n\n// Final Hadamard\nh q[0];\nid q[1];",
  f1: oracleQASM.f1 + "\n\n// Final Hadamard\nh q[0];\nid q[1];",
  f2: oracleQASM.f2 + "\n\n// Final Hadamard\nh q[0];\nid q[1];",
  f3: oracleQASM.f3 + "\n\n// Final Hadamard\nh q[0];\nid q[1];",
};

const measurementQASM: Record<DeutschFunction, string> = {
  f0: finalHQASM.f0 + "\n\n// Measurement\nc[0] = measure q[0];",
  f1: finalHQASM.f1 + "\n\n// Measurement\nc[0] = measure q[0];",
  f2: finalHQASM.f2 + "\n\n// Measurement\nc[0] = measure q[0];",
  f3: finalHQASM.f3 + "\n\n// Measurement\nc[0] = measure q[0];",
};

export function openQASMDeutschStep(
  step: number,
  fn: DeutschFunction
): OpenQASMResult | null {
  const oraclef2 = fn === "f2" ? 3 : 1;
  const prep_step = 1;
  const superpos_step = 2;
  const oracle_end_step = 3 + oraclef2;
  const finalh_step = oracle_end_step + 2;
  const meas_step = oracle_end_step + 3;

  let phase = "";
  let openQASM = "";

  if (step === 0) {
    phase = "default";
    openQASM = phaseLabels[phase];
  } else if (step === prep_step) {
    phase = "prep";
    openQASM = phaseLabels[phase];
  } else if (step === superpos_step) {
    phase = "superpos";
    openQASM = phaseLabels[phase];
  } else if (step === oracle_end_step || (fn === "f2" && (step === 4 || step === 5))) {
    phase = "oracle";
    openQASM = oracleQASM[fn];
  } else if (step === finalh_step) {
    phase = "finalh";
    openQASM = finalHQASM[fn];
  } else if (step === meas_step) {
    phase = "meas";
    openQASM = measurementQASM[fn];
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
    openQASM 
  };
}
