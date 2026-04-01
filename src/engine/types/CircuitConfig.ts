import type { Qubit } from "../Qubit";

export interface CircuitConfig {
  algoName: string;
  qubitCount: number;
  initialState: Qubit;
  allowedGates: string[];
  presetSlots?: Record<string, string[]>;
  locked?: boolean;
  meta?: {
    control: number;
    control2?: number;
    control3?: number;
    target: number;
  }
}