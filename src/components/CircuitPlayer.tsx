import { useRef, useState } from "react";

type GateStep = {
  lineId: string;
  gateType: string;
};
type Step = GateStep[];

type Slots = Record<string, string[]>;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useCircuitPlayer(
  steps: Step[],
  qubitCount: number,
  setSlots: React.Dispatch<React.SetStateAction<Slots>>
) {
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const stepIndexRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(false);

  //draws the circuit step-by-step
  function buildSlots(stepCount: number) {
    const newSlots: Slots = Object.fromEntries(
      Array.from({ length: qubitCount }, (_, i) => [`line-${i}`, []])
    );

    for (let i = 0; i < stepCount; i++) {
      const step = steps[i];

      for (const gate of step) {
        const instanceId = `${gate.gateType}-${i}-${gate.lineId}`;
        newSlots[gate.lineId].push(instanceId);
      }
    }

    setSlots(newSlots);
  }

  function appendGate(gate: GateStep, stepIndex: number) {
  setSlots(prev => {
    const copy = { ...prev };

    const instanceId = `${gate.gateType}-${stepIndex}-${gate.lineId}`;

    copy[gate.lineId] = [...copy[gate.lineId], instanceId];

    return copy;
  });
}
  // to pause without breaking
  async function waitWithPause(ms: number) {
    let elapsed = 0;

    while (elapsed < ms) {
      if (isPausedRef.current) {
        await sleep(50);
        continue;
      }

      await sleep(50);
      elapsed += 50;
    }
  }

  // allows play (safety check muna)
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

    while (stepIndexRef.current < steps.length) {
      const step = steps[stepIndexRef.current];

      for (let gateIndex = 0; gateIndex < step.length; gateIndex++) {

        if (isPausedRef.current) {
          await sleep(50);
          gateIndex--; 
          continue;
        }

        await waitWithPause(gateDelay);

        appendGate(step[gateIndex], stepIndexRef.current);
      }

      stepIndexRef.current += 1;

      // longer pause after finishing a step
      if (stepIndexRef.current < steps.length) {
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
    if (stepIndexRef.current >= steps.length) return;

    stepIndexRef.current += 1;
    buildSlots(stepIndexRef.current);
  }

  function stepBack() {
    if (stepIndexRef.current <= 0) return;

    stepIndexRef.current -= 1;
    buildSlots(stepIndexRef.current);
  }

  function reset() {
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