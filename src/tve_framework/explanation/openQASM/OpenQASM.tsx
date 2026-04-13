import { useEffect, useRef } from "react";
import type { OpenQASMResult } from "./DeutschOpenQASM";

interface Props {
  result: OpenQASMResult | null;
  currentStep: number;
}

export default function OpenQASM({ result, currentStep }: Props) {
  const displayStep: Record<number, number> = {
    0: 0,
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
  };
  const bottomRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth"});
  }, [result]);


  return (
      <div className="flex flex-col p-4 border border-black/20 rounded-sm bg-white h-full">      
        <div className="flex-1 min-h-0 overflow-y-auto">
          {result ? (
            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed">
              {result.openQASM}
            </pre>
          ) : (
            <p className="text-sm text-gray-400 italic">
              Press play or step forward to begin.
            </p>
          )}
          <div ref={bottomRef}/>
        </div>
      <div className="text-xs text-gray-400 text-right">
        {result ? `Step ${displayStep[result.step] ?? result.step} of 5` : "Step"}
      </div>
    </div>
  );
};
