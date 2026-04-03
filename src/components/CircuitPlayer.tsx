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
  setMultiSlots: React.Dispatch<React.SetStateAction<Record<string, { control: number; control2?: number, control3?: number, target: number; }>>>,
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

      for (const gate of step) {
        const instanceId = `${gate.gateType}-${i}-${gate.lineId}`;
        // only push once — for CNOT, both lines share the same instanceId
        // so use control line as the canonical push point
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

            // space filler 
            const min = Math.min(gate.meta.control, gate.meta.target);
            const max = Math.max(gate.meta.control, gate.meta.target);
            for (let i = min + 1; i < max; i++){
              newSlots[`line-${i}`].push(`SPACE-${cnotId}-${i}`);
            } 
          }
        } else if (gate.gateType === "T"){
          if (gate.meta && gate.meta.control === parseInt(gate.lineId.split("-")[1])) {
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

          }
        } else {
          newSlots[gate.lineId].push(instanceId);
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
  function addGate (gate: GateStep, stepIndex: number) {
    if (gate.gateType === "CNOT" && gate.meta) {
      if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) {
        return;
      }
      const cnotId = `CNOT-${stepIndex}`;
      const controlId = `line-${gate.meta.control}`;
      const targetId = `line-${gate.meta.target}`;

      setMultiSlots(prev => ({
        ...prev,
        [cnotId]: { control: gate.meta!.control, target: gate.meta!.target }
      }));
      // space filler 
      const min = Math.min(gate.meta.control, gate.meta.target);
      const max = Math.max(gate.meta.control, gate.meta.target);   
           
      setSlots(prev => {
        const updated = { ...prev };
        updated[controlId] = [...updated[controlId], cnotId];
        updated[targetId] = [...updated[targetId], cnotId];

        for (let i = min + 1; i < max; i++){
          updated[`line-${i}`] = [...updated[`line-${i}`], `SPACE-${cnotId}-${i}`];
        } 
        return updated;
      });

    } else if (gate.gateType === "T" && gate.meta) {
      if (gate.meta.control !== parseInt(gate.lineId.split("-")[1])) {
        return;
      }
      const toffoliId = `T-${stepIndex}`;
      const controlId = `line-${gate.meta.control}`;
      const control2Id = `line-${gate.meta.control2}`;
      const control3Id = `line-${gate.meta.control3}`;
      const targetId = `line-${gate.meta.target}`;
      setMultiSlots(prev => ({
        ...prev,
        [toffoliId]: { control: gate.meta!.control,
           control2: gate.meta!.control2,
           control3: gate.meta!.control3,
          target: gate.meta!.target
        }
      }));
      setSlots(prev => ({
        ...prev,
        [controlId]: [...prev[controlId], toffoliId],
        [control2Id]: [...prev[control2Id], toffoliId],
        [control3Id]: [...prev[control3Id], toffoliId],
        [targetId]: [...prev[targetId], toffoliId],
      }));
    } else {
      setSlots(prev => {
        const copy = {...prev};
        const instanceId = `${gate.gateType}-${stepIndex}-${gate.lineId}`;
        copy[gate.lineId] = [...copy[gate.lineId], instanceId];
        return copy;
      });
    }
  }

  async function play() {
    if (isPlayingRef.current) {
      isPausedRef.current = false;
      setIsPlaying(true);
      return;
    }

    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);

    const gateDelay = 400;
    const stepDelay = 1000;
    // get steps then loop sa gates
    while (stepIndexRef.current < stepsRef.current.length) {
      const step = stepsRef.current[stepIndexRef.current];

      for (let gateIndex = 0; gateIndex < step.length; gateIndex++) {
        if (isPausedRef.current) {
          await sleep(50);
          gateIndex--;
          continue;
        }

        await waitWithPause(gateDelay);
        addGate(step[gateIndex], stepIndexRef.current);
      }

      stepIndexRef.current += 1;

      if (onStepChange) {
        await onStepChange(stepIndexRef.current);
      }
      // pause ng 1 sec after every steps
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
  }

  function stepBack() {
    pause();
    if (stepIndexRef.current <= 0) return;

    stepIndexRef.current -= 1;
    buildSlots(stepIndexRef.current);
  }

  function reset() {
    pause();
    stepIndexRef.current = 0;
    buildSlots(0);
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
