import type { Qubit } from "../Qubit";

export interface CircuitConfig {
  algoName: string;
  qubitCount: number;
  initialState: Qubit;
  allowedGates: string[];
  presetSlots?: Record<string, string[]>;
  locked?: boolean;
}