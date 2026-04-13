import type { ExplanationResult } from "./DeutschExplanation";

interface Props {
  result: ExplanationResult | null;
  currentStep: number; // do not remove
}

export default function Explanation({ result, currentStep }: Props) {
  const displayStep: Record<number, number> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  };

  return (
    <div className="flex flex-col gap-3 p-4 border border-black/20 rounded-sm h-44 min-h-0 overflow-y-scroll">
      <div className="flex flex-1 items-start">
        <p className="text-sm text-gray-700 leading-relaxed">
          {result ? (
            result.explanation
          ) : (
            <span className="text-gray-400 italic">
              Press play or step forward to begin.
            </span>
          )}
        </p>
      </div>
      <div className="text-xs text-gray-400 text-right">
        {result ? `Step ${displayStep[result.step] ?? result.step} of 5` : "Step"}
      </div>
    </div>
  );
}