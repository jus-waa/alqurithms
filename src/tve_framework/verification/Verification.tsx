import type { VerificationResult } from "./DeutschVerification"
interface Props {
  result: VerificationResult | null;
  currentStep: number;
}

export default function Verification({ result, currentStep }: Props) {
  const displayStep: Record<number, string> = {
    0: "State |0⟩",
    1: "State |1⟩",
    3: "State |2⟩",
    4: "State |3⟩",
    5: "Output",
  };
  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
        <span className="text-2xl">🔬</span>
        <p className="text-xs text-gray-400 italic">
          Verification result not available
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col h-full gap-3 p-1">
      {/* Step + pass/fail badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
          Step {displayStep[result.step] ?? result.step} of 5
        </span>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            result.passed
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {result.passed ? "VERIFIED" : "MISMATCH"}
        </span>
      </div>

      {/* Label card */}
      <div
        className={`rounded-lg px-3 py-2 text-sm font-semibold border ${
          result.passed
            ? "bg-green-50 border-green-200 text-green-800"
            : "bg-red-50 border-red-200 text-red-800"
        }`}
      >
        {result.label}
      </div>

      {/* Expected / Actual */}
      <div className="flex flex-col gap-2 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-400 uppercase tracking-wide text-[9px] font-semibold">Expected</span>
          <span className="font-mono text-gray-700 bg-gray-50 rounded px-2 py-1 border border-gray-100">
            {result.expected}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-gray-400 uppercase tracking-wide text-[9px] font-semibold">Actual</span>
          <span
            className={`font-mono rounded px-2 py-1 border ${
              result.passed
                ? "text-green-700 bg-green-50 border-green-100"
                : "text-red-600 bg-red-50 border-red-100"
            }`}
          >
            {result.actual}
          </span>
        </div>
      </div>
    </div>
  );
}