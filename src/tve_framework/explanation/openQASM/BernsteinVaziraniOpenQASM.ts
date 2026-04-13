export type OpenQASMResult = {
  step: number;
  openQASM: string;
};

const initial = "OPENQASM 3;\n\nqubit[5] q;\nbit[4] c;\n";
const prep = initial + "\nx q[4];";
const superpos = prep + "\nh q[0];\nh q[1];\nh q[2];\nh q[3];\nh q[4];";

// Oracle: s = 1011, step 4 5
const o1 = superpos + "\n\n// Oracle: s[0] = 1\ncx q[0], q[4];";
// Oracle: s[2] = 1, step 6 7
const o2 = o1 + "\n\n// Oracle: s[2] = 1\ncx q[2], q[4];";
// Oracle: s[3] = 1, step 8 9
const o3 = o2 + "\n\n// Oracle: s[3] = 1\ncx q[3], q[4];";

const finalH = o3 + "\n\n// Final Hadamard\nh q[0];\nh q[1];\nh q[2];\nh q[3];\nid q[4];";
const meas0 = finalH + "\n\n// Measurement\nc[0] = measure q[0];";
const meas1 = meas0 + "\nc[1] = measure q[1];";
const meas2 = meas1 + "\nc[2] = measure q[2];";
const meas3 = meas2 + "\nc[3] = measure q[3];";

export function openQASMBernsteinVaziraniStep(step: number): OpenQASMResult | null {
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

  const oracle1Map: Record<number, string> = {
    4: o1,
    5: o1,
  };
  const oracle2Map: Record<number, string> = {
    6: o2,
    7: o2,
  };
  const oracle3Map: Record<number, string> = {
    8: o3,
    9: o3,
  };
 const measMap: Record<number, string> = {
    [meas_start]:     meas0,
    [meas_start + 1]: meas1,
    [meas_start + 2]: meas2,
    [meas_end]:       meas3,
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
  } else if (step >= oracle_step_1 && step <= oracle_step_1_end) {
    phase = "o1";
    openQASM = oracle1Map[step] ?? o1;
  } else if (step >= oracle_step_2 && step <= oracle_step_2_end) {
    phase = "o2";
    openQASM = oracle2Map[step] ?? o2;
  } else if (step >= oracle_step_3 && step <= oracle_step_3_end) {
    phase = "o3";
    openQASM = oracle3Map[step] ?? o3;
  } else if (step === finalh_step) {
    phase = "finalh";
    openQASM = finalH;
  } else if (step >= meas_start && step <= meas_end) {
    phase = "meas";
    openQASM = measMap[step] ?? meas3;
  } else {
    return null;
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
    openQASM,
  };
}