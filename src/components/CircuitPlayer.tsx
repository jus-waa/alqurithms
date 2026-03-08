import { useRef, useState } from "react";

type GateStep = {
  lineId: string;
  gateType: string;
};

type Slots = Record<string, string[]>;

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function useCircuitPlayer(
  steps: GateStep[],
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
      const { lineId, gateType } = steps[i];
      const instanceId = `${gateType}-${i}`;

      newSlots[lineId].push(instanceId);
    }

    setSlots(newSlots);
  }

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

  async function play() {
    if (isPlayingRef.current) {
      isPausedRef.current = false;
      setIsPlaying(true);
      return;
    }

    isPlayingRef.current = true;
    isPausedRef.current = false;
    setIsPlaying(true);

    while (stepIndexRef.current < steps.length) {
      if (isPausedRef.current) {
        await sleep(50);
        continue;
      }

      await waitWithPause(600);

      stepIndexRef.current += 1;
      buildSlots(stepIndexRef.current);
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