export type OpenQASMResult = {
  step: number;
  openQASM: string;
};

const initial = "OPENQASM 3;\n\nqubit[4] q;\nbit[3] c;\n";
const prep = initial + "\nx q[3];";
const superpos = prep + "\nh q[0];\nh q[1];\nh q[2];\nh q[3];";

// Oracle 1: f(001) step 4 5 6
const o1_x = superpos + "\n\n// Oracle: f(001) = 1\nx q[0];\nx q[1];";
const o1_c3x = o1_x + "\nc3x q[0], q[1], q[2], q[3];";
const o1_done = o1_c3x + "\nx q[0];\nx q[1];";

// Oracle 2: f(011) step 8 9 10
const o2_x = o1_done + "\n\n// Oracle: f(011) = 1\nx q[0];";
const o2_c3x = o2_x + "\nc3x q[0], q[1], q[2], q[3];";
const o2_done = o2_c3x + "\nx q[0];";

// Oracle 3: f(110) step 12 13 14
const o3_x = o2_done + "\n\n// Oracle: f(110) = 1\nx q[2];";
const o3_c3x = o3_x + "\nc3x q[0], q[1], q[2], q[3];";
const o3_done = o3_c3x + "\nx q[2];";

// Oracle 4: f(111) step 16 17
const o4_done = o3_done + "\n\n// Oracle: f(111) = 1\nc3x q[0], q[1], q[2], q[3];";

const finalH = o4_done + "\n\n// Final Hadamard\nh q[0];\nh q[1];\nh q[2];\nid q[3];";
const meas0 = finalH + "\n\n// Measurement\nc[0] = measure q[0];";
const meas1 = meas0 + "\nc[1] = measure q[1];";
const meas2 = meas1 + "\nc[2] = measure q[2];";

export function openQASMDeutschJozsaStep(step: number): OpenQASMResult | null {
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

  const oracle1Map: Record<number, string> = {
    4: o1_x,
    5: o1_c3x,
    6: o1_done,
  };
  const oracle2Map: Record<number, string> = {
    8: o2_x,
    9: o2_c3x,
    10: o2_done,
  };
  const oracle3Map: Record<number, string> = {
    12: o3_x,
    13: o3_c3x,
    14: o3_done,
  };
  const measMap: Record<number, string> = {
    [meas_start]:     meas0,
    [meas_start + 1]: meas1,
    [meas_end]:       meas2,
  };

  let phase = "";
  let openQASM = "";

  if (step === 0) {
    phase = "default";
    openQASM = initial;
  } else if (step === prep_step) {
    phase = "prep";
    openQASM = prep;
  } else if (step === superpos_step) {
    phase = "superpos";
    openQASM = superpos;
  } else if (step >= oracle_step_1 && step < oracle_step_1_end) {
    phase = "oracle_1";
    openQASM = oracle1Map[step] ?? o1_done;
  } else if (step >= oracle_step_2 && step < oracle_step_2_end) {
    phase = "oracle_2";
    openQASM = oracle2Map[step] ?? o2_done;
  } else if (step >= oracle_step_3 && step < oracle_step_3_end) {
    phase = "oracle_3";
    openQASM = oracle3Map[step] ?? o3_done;
  } else if (step >= oracle_step_4 && step <= oracle_step_4_end) {
    phase = "oracle_4";
    openQASM = o4_done;
  } else if (step === finalh_step) {
    phase = "finalh";
    openQASM = finalH;
  } else if (step >= meas_start && step <= meas_end) {
    phase = "meas";
    openQASM = measMap[step] ?? meas2;  
  } else {
    return null;
  }
  
  const logicalStepNum: Record<string, number> = {
    default:  0,
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
    openQASM
  };
}