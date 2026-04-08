import { useRef, useState } from "react";

type GateStep = {
  lineId: string;
  gateType: string;
  meta?: {
    control: number;
    control2?: number;
    control3?: number;
    target: number;
  }
};
type Step = GateStep[];
type Slots = Record<string, string[]>;
const useCircuitPlayer = ( 
  stepsRef: React.MutableRefObject<Step[]>, 
  qubitCount: number, 
  setSlots: React.Dispatch<React.SetStateAction<Slots>>,
  setMultiSlots: React.Dispatch<React.SetStateAction<Record<string, { control: number; control2?: number, control3?: number, target: number, measurement?: number}>>>,
  onStepChange?: (step: number) => Promise<void> | void
) => {
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const stepIndexRef = useRef(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // build entire circuit step-by-step 
  // newSlots allow new lines
  // loop through steps then loop through gates
  function buildSlots(stepCount: number) {
    const newSlots: Slots = Object.fromEntries(
      Array.from({ length: qubitCount }, (_, i) => [`line-${i}`, []])
    );
    const newMultiSlots: Record<string, { control: number; control2?: number; control3?: number; target: number }> = {};

    for (let i = 0; i < stepCount; i++) {
      const step = stepsRef.current[i];

      const coveredLines = new Set<string>();

      for (const gate of step) {
        coveredLines.add(gate.lineId);
        if (gate.gateType === "CNOT") {
          if (gate.meta && gate.meta.control === parseInt(gate.lineId.split("-")[1])) {
            const controlId = `line-${gate.meta.control}`;
            const targetId = `line-${gate.meta.target}`;
            const cnotId = `CNOT-${i}`; //shared id for both lines
            newMultiSlots[cnotId] = { 
              control: gate.meta.control, 
              target: gate.meta.target 
            };
            newSlots[controlId].push(cnotId);
            newSlots[targetId].push(cnotId);
            coveredLines.add(`line-${gate.meta.control}`);
            coveredLines.add(`line-${gate.meta.target}`); 
            // space filler 
            const min = Math.min(gate.meta.control, gate.meta.target);
            const max = Math.max(gate.meta.control, gate.meta.target);
            for (let j = min + 1; j < max; j++){
              coveredLines.add(`line-${j}`);
              newSlots[`line-${j}`].push(`SPACE-${cnotId}-${j}`);
            }
          }
        } else if (gate.gateType === "T" && gate.meta) {
          if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) continue;
          const controlId = `line-${gate.meta.control}`;
          const control2Id = `line-${gate.meta.control2}`;
          const control3Id = `line-${gate.meta.control3}`;
          const targetId = `line-${gate.meta.target}`;
          const toffoliId = `T-${i}`;
          newMultiSlots[toffoliId] = {
            control: gate.meta.control, 
            control2: gate.meta.control2,
            control3: gate.meta.control3,
            target: gate.meta.target 
          };
          newSlots[controlId].push(toffoliId);
          newSlots[control2Id].push(toffoliId);
          newSlots[control3Id].push(toffoliId);
          newSlots[targetId].push(toffoliId);
          // for barrier
          coveredLines.add(`line-${gate.meta.control}`);
          coveredLines.add(`line-${gate.meta.control2!}`);
          coveredLines.add(`line-${gate.meta.control3!}`);
          coveredLines.add(`line-${gate.meta.target}`);
        } else if (gate.gateType === "M") {
          const lineIndex = parseInt(gate.lineId.split("-")[1]);
          const measurementId = `M-${i}-${lineIndex}`;  // ← ADD lineIndex
          newSlots[gate.lineId].push(measurementId);
          newMultiSlots[measurementId] = { control: lineIndex, target: lineIndex };
          for (let j = lineIndex + 1; j < qubitCount; j++) {
            coveredLines.add(`line-${j}`);
            newSlots[`line-${j}`].push(`SPACE-${measurementId}-${j}`);
          }
        } else {
          newSlots[gate.lineId].push(`${gate.gateType}-${i}`);
        }
      }
      // filler lang for barrier
      for (let q = 0; q < qubitCount; q++) {
        const lineId = `line-${q}`;
        if (!coveredLines.has(lineId)) {
          newSlots[lineId].push(`SPACE-empty-${i}-${q}`);
        }
      }
    }
    setSlots(newSlots);
    setMultiSlots(newMultiSlots);
  }

  function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function waitWithPause(ms: number) {
    let elapsed= 0;

    while (elapsed < ms) {
      if (isPausedRef.current) {
        await sleep(50);
        continue;
      }

      await sleep(50);
      elapsed += 50;
    }
  }
  
  // copy for: exisitng gate + new gates
  // function addGate (gate: GateStep, stepIndex: number) {
  //   if (gate.gateType === "CNOT" && gate.meta) {
  //     if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) {
  //       return;
  //     }
  //     const cnotId = `CNOT-${stepIndex}`;
  //     const controlId = `line-${gate.meta.control}`;
  //     const targetId = `line-${gate.meta.target}`;

  //     setMultiSlots(prev => ({
  //       ...prev,
  //       [cnotId]: { 
  //         control: gate.meta!.control, 
  //         target: gate.meta!.target 
  //       }
  //     }));
  //     // space filler 
  //     const min = Math.min(gate.meta.control, gate.meta.target);
  //     const max = Math.max(gate.meta.control, gate.meta.target);   
           
  //     setSlots(prev => {
  //       const updated = { ...prev };
  //       updated[controlId] = [...updated[controlId], cnotId];
  //       updated[targetId] = [...updated[targetId], cnotId];

  //       for (let i = min + 1; i < max; i++){
  //         updated[`line-${i}`] = [...updated[`line-${i}`], `SPACE-${cnotId}-${i}`];
  //       } 
  //       return updated;
  //     });

  //   } else if (gate.gateType === "T" && gate.meta) {
  //     if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) {
  //       return;
  //     }
  //     const toffoliId = `T-${stepIndex}`;
  //     const controlId = `line-${gate.meta.control}`;
  //     const control2Id = `line-${gate.meta.control2}`;
  //     const control3Id = `line-${gate.meta.control3}`;
  //     const targetId = `line-${gate.meta.target}`;

  //     setMultiSlots(prev => ({
  //       ...prev,
  //       [toffoliId]: { 
  //         control: gate.meta!.control,
  //         control2: gate.meta!.control2,
  //         control3: gate.meta!.control3,
  //         target: gate.meta!.target
  //       }
  //     }));

  //     setSlots(prev => ({
  //       ...prev,
  //       [controlId]: [...prev[controlId], toffoliId],
  //       [control2Id]: [...prev[control2Id], toffoliId],
  //       [control3Id]: [...prev[control3Id], toffoliId],
  //       [targetId]: [...prev[targetId], toffoliId],
  //     }));
  //   } else if (gate.gateType === "M") {
  //     const lineIndex = parseInt(gate.lineId.split("-")[1]);
  //     const measurementId = `M-${stepIndex}`; 
  //     setMultiSlots(prev => ({ ...prev, [measurementId]: { control: lineIndex, target: lineIndex }}));
  //     setSlots(prev => {
  //       const updated = { ...prev };
  //       updated[gate.lineId] = [...updated[gate.lineId], measurementId];
  //       for (let i = lineIndex + 1; i < qubitCount; i++) {
  //         updated[`line-${i}`] = [...updated[`line-${i}`], `SPACE-${measurementId}-${i}`];
  //       }
  //       return updated;
  //     });
  //   } else {
  //     setSlots(prev => {
  //       const copy = {...prev};
  //       copy[gate.lineId] = [...copy[gate.lineId], `${gate.gateType}-${stepIndex}`];
  //       return copy;
  //     });
  //   }
  // }

  async function play() {
    if (isPlayingRef.current) {
      isPausedRef.current = false;
      setIsPlaying(true);
      return;
    }

    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);

    const stepDelay = 1000;

    while (stepIndexRef.current < stepsRef.current.length) {
      if (isPausedRef.current) {
        await sleep(50);
        continue; 
      }
      const step = stepsRef.current[stepIndexRef.current];
      const stepIdx = stepIndexRef.current;
      const coveredLines = new Set<string>();
      const newMultiSlotEntries: Record<string, { control: number; control2?: number, control3?: number; target: number }> = {};
      const slotUpdates: Record<string, string[]> = {};

      for (const gate of step) {
        coveredLines.add(gate.lineId);
        if (gate.gateType === "CNOT" && gate.meta) {
          if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) continue;
          const cnotId = `CNOT-${stepIdx}`;
          const min = Math.min(gate.meta.control, gate.meta.target);
          const max = Math.max(gate.meta.control, gate.meta.target);
          slotUpdates[`line-${gate.meta.control}`] = [cnotId];
          slotUpdates[`line-${gate.meta.target}`] = [cnotId];
          coveredLines.add(`line-${gate.meta.control}`);
          coveredLines.add(`line-${gate.meta.target}`);
          newMultiSlotEntries[cnotId] = { control: gate.meta.control, target: gate.meta.target };
          for (let j = min + 1; j < max; j++) {
            slotUpdates[`line-${j}`] = [`SPACE-${cnotId}-${j}`];
            coveredLines.add(`line-${j}`);
          }
        } else if (gate.gateType === "T" && gate.meta) {
          if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) continue;
          const toffoliId = `T-${stepIdx}`;
          slotUpdates[`line-${gate.meta.control}`] = [toffoliId];
          slotUpdates[`line-${gate.meta.control2!}`] = [toffoliId];
          slotUpdates[`line-${gate.meta.control3!}`] = [toffoliId];
          slotUpdates[`line-${gate.meta.target}`] = [toffoliId];
          coveredLines.add(`line-${gate.meta.control}`);
          coveredLines.add(`line-${gate.meta.control2!}`);
          coveredLines.add(`line-${gate.meta.control3!}`);
          coveredLines.add(`line-${gate.meta.target}`);
          newMultiSlotEntries[toffoliId] = {
            control: gate.meta.control,
            control2: gate.meta.control2,
            control3: gate.meta.control3,
            target: gate.meta.target
          };
        } else if (gate.gateType === "M") {
          const lineIndex = parseInt(gate.lineId.split("-")[1]);
          const measurementId = `M-${stepIdx}-${lineIndex}`;  // ← ADD lineIndex
          slotUpdates[gate.lineId] = [measurementId];
          coveredLines.add(gate.lineId);
          newMultiSlotEntries[measurementId] = { control: lineIndex, target: lineIndex };
          for (let j = lineIndex + 1; j < qubitCount; j++) {
            slotUpdates[`line-${j}`] = [`SPACE-${measurementId}-${j}`];
            coveredLines.add(`line-${j}`);
          }
        } else {
          slotUpdates[gate.lineId] = [`${gate.gateType}-${stepIdx}`];
        }
      }

      for (let q = 0; q < qubitCount; q++) {
        const lineId = `line-${q}`;
        if (!coveredLines.has(lineId)) {
          slotUpdates[lineId] = [`SPACE-empty-${stepIdx}-${q}`];
        }
      }

      setSlots(prev => {
        const updated = { ...prev };
        for (const [lineId, gates] of Object.entries(slotUpdates)) {
          updated[lineId] = [...updated[lineId], ...gates];
        }
        return updated;
      });

      if (Object.keys(newMultiSlotEntries).length > 0) {
        setMultiSlots(prev => ({ ...prev, ...newMultiSlotEntries }));
      }
      stepIndexRef.current += 1;
      if (onStepChange) {
        await onStepChange(stepIndexRef.current);
      }
      if (stepIndexRef.current < stepsRef.current.length) {
        await waitWithPause(stepDelay);
      }
    }

    isPlayingRef.current = false;
    setIsPlaying(false);
  }

  function pause() {
    isPausedRef.current = true;
    setIsPlaying(false);
  }

  function stepForward() {
    pause();
    if (stepIndexRef.current >= stepsRef.current.length) return;

    stepIndexRef.current += 1;
    buildSlots(stepIndexRef.current);
    if (onStepChange) {
      onStepChange(stepIndexRef.current);
    }
  }

  function stepBack() {
    pause();
    if (stepIndexRef.current <= 0) return;

    stepIndexRef.current -= 1;
    buildSlots(stepIndexRef.current);
    if (onStepChange) {
      onStepChange(stepIndexRef.current);
    }
  }

  function reset() {
    pause();
    stepIndexRef.current = 0;
    buildSlots(0);
    if (onStepChange) {
      onStepChange(0);
    }
  }

  return {
    play, 
    pause,
    stepForward,
    stepBack,
    reset,
    isPlaying
  };
}

export default useCircuitPlayer;
