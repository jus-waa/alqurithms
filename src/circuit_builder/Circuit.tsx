import { useEffect, useState, useRef} from "react"
import { DndContext} from '@dnd-kit/core'

import Line from "./Line"
import Gate from './Gate'
import Probabilities from "../components/Probabilities";
import MultiQubitModal from "../components/MultiQubitModal";
import QSphere from "../components/QSphere";

import { applyHadamardToQubit } from "../engine/gates/Hadamard";
import { applyPauliXToQubit } from "../engine/gates/PauliX";
import { applyCNOTToQubit } from "../engine/gates/CNOT";
import { applyToffoliToQubit } from "../engine/gates/Toffoli";
import { applyPauliIToQubit } from "../engine/gates/PauliI";
import { applyPauliZToQubit } from "../engine/gates/PauliZ";
import { applyBarrierToQubit } from "../engine/gates/Barrier";
import { measureQubit } from "../engine/gates/Measurement";
import useCircuitPlayer from "../tve_framework/trace/CircuitPlayer";
import type { CircuitConfig } from "../engine/types/CircuitConfig";
import type { Qubit } from "../engine/qubit/Qubit";
import VerticalLines from "../tve_framework/trace/VerticalLines";
import { verifyDeutschStep } from "../tve_framework/verification/DeutschVerification.ts";
import type { DeutschFunction, VerificationResult } from "../tve_framework/verification/DeutschVerification.ts";
import Verification from "../tve_framework/verification/Verification";
type GateStep = {
  lineId: string;
  gateType: string;
  meta?: {
    control: number;
    target: number;
  }
}

interface Metadata {
  control: number;
  control2?: number;
  control3?: number;
  target: number;
}

interface CircuitProps {
  config: CircuitConfig;
  steps: GateStep[][];
  selectedFunction?: DeutschFunction;
  onStepChange?: (step: number) => Promise<void> | void;
}

const Circuit = ( {config, steps, selectedFunction, onStepChange }:CircuitProps) => {
  const [state, setState] = useState(config.initialState) //e.g. ket0000 = 0000
  const [slots, setSlots] = useState<Record<string, string[]>> (
    Object.fromEntries(
      Array.from({ length: config.qubitCount }, (_, i) => [`line-${i}`, []])
    )
  );
  const [multiSlots, setMultiSlots] = useState<Record<string, Metadata>>({});
  const [pending, setPending] = useState<{lineId: string, lineIndex: number, instanceId: string} | null>(null);
  const [showModal, setShowModal] = useState(false);  

  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [currentVerifyStep, setCurrentVerifyStep] = useState(0);
  const currentStateRef = useRef<Qubit>(config.initialState);

  const measurementResultsRef = useRef<Record<string, Qubit>>({});  const circuitContainerRef = useRef<HTMLDivElement>(null)
  const gateRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const lineRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const lines = Array.from({ length: config.qubitCount }, (_,i) => ({
    id: `line-${i}`,
    name: `q${i}`,
  }));
  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  }, [steps])
  const {
    play: handlePlay,
    pause: handlePause,
    stepForward,
    stepBack,
    reset: resetPlayer,
    isPlaying
  } = useCircuitPlayer(stepsRef, config.qubitCount, setSlots, setMultiSlots, handleStepChangeWrapper);
  
  async function handleStepChangeWrapper(step: number) {
    setCurrentVerifyStep(step);
    if (onStepChange) await onStepChange(step);
  }

  function reset() {
    measurementResultsRef.current = {};
    resetPlayer();
  }
  // helper to register a gate ref
  function registerGateRef(instanceId: string, lineIndex: number) {
    return (element: HTMLDivElement | null) => {
      if (instanceId.startsWith("M")) {
        gateRefs.current[`${instanceId}`] = element;
      } else {
        gateRefs.current[`${instanceId}-${lineIndex}`] = element;
      }
    }
  }
  // config.locked is for locking the algo structure
  // filter single and multiqubit gates
  function handleDragEnd(event) {
    if (config.locked) return;
    const { active, over } = event;
    const gateType = active.id.split("-")[0];
    if (gateType === "CNOT" || gateType === "T") {
      handleMultiQubitGates(active, over);
    } else {
      handleSingleQubitGates(active, over);
    }
  }

  function handleSingleQubitGates(active, over) {
    setSlots((prev) => {
      let qubitLine: string | null = null;
     
      // checks if gate is already in circuit if it its then remove
      for (const line in prev) {
        if (prev[line].includes(active.id)) {
          qubitLine = line;
          break; 
        }
      }
      // check if its a new instance or existing
      const isExisting = !!qubitLine;
      // generate or reuse id 
      const instanceId = isExisting ? active.id : `${active.id}-${Math.random().toString(36).slice(2, 9)}`;
      // get latest state
      const updated = { ...prev };
      // if dropped outside
      if (!over) {
        if(qubitLine && updated[qubitLine]) {
          updated[qubitLine] = updated[qubitLine].filter((id) => id !== instanceId); 
        }
        return updated;
      }
      // if drop on the same line from the same line do nothing
      if (qubitLine === over.id && prev[over.id].includes(instanceId)) {
        return prev;
      }
      // if gate exist then remove from the old line
      if (isExisting && qubitLine && updated[qubitLine]) {
        updated[qubitLine] = updated[qubitLine].filter((id) => id !== instanceId); 
      }
      // add the gate
      if (!updated[over.id].includes(instanceId)) {
        updated[over.id] = [...updated[over.id], instanceId];
      }
      return updated;
    });
  }

  function handleMultiQubitGates(active, over) {
    const gateType = active.id.split("-")[0];
    if (gateType !== "CNOT" && gateType !== "T") {
      return; 
    }
    const isExisting = multiSlots[active.id];
    const instanceId = isExisting ? active.id : `${gateType}-${Math.random().toString(36).slice(2, 9)}`;
    // delete if drg outside (del case)
    if (!over) {
      if (isExisting)  {
        const ids = (gateType === "T")
        ? [lines[isExisting.control].id, lines[isExisting.control2!].id, lines[isExisting.control3!].id, lines[isExisting.target].id]
        : [lines[isExisting.control].id, lines[isExisting.target].id];

        setSlots(prev => {
          const updated = { ...prev };
          ids.forEach(id => {
            updated[id] = updated[id].filter(g => g !== instanceId);
          });
          return updated;
        });

        setMultiSlots(prev => {
          const updated = {...prev};
          delete updated[instanceId];
          return updated;
        });
        return;
      }
      return;
    }

    const controlId = over.id;
    const controlIndex = lines.findIndex(line => line.id === controlId);

    // if already placed on the same line, do nothing
    if (isExisting && isExisting.control === controlIndex) return;

    // move case
    if (isExisting) {
      const ids = gateType === "T"
        ? [lines[isExisting.control].id, lines[isExisting.control2!].id, lines[isExisting.control3!].id, lines[isExisting.target].id]
        : [lines[isExisting.control].id, lines[isExisting.target].id];

      setSlots(prev => {
        const updated = { ...prev };
        ids.forEach(id => {
          updated[id] = updated[id].filter(g => g !== instanceId);
        });
        return updated;
      });

      setMultiSlots(prev => {
        const updated = { ...prev };
        delete updated[instanceId];
        return updated;
      });
    }

    //toffoli
    if(gateType === "T") {
      const c1 = controlIndex;
      const c2 = controlIndex + 1;
      const c3 = controlIndex + 2;
      const t = controlIndex + 3;

      if (!lines[t]) {
        alert("Toffoli needs 3 lines below the drop point.");
        return;
      }
      setMultiSlots(prev => ({
        ...prev,
        [instanceId]: { control: c1, control2: c2, control3: c3, target: t }
      }));

      setSlots(prev => ({
        ...prev,
        [lines[c1].id]: [...prev[lines[c1].id], instanceId],
        [lines[c2].id]: [...prev[lines[c2].id], instanceId],
        [lines[c3].id]: [...prev[lines[c3].id], instanceId],
        [lines[t].id]: [...prev[lines[t].id], instanceId]
      }));
    } else { //cnot
      const targetIndex = controlIndex + 1;
      const targetId = lines[targetIndex]?.id;

      if (!targetId) {
        alert("CNOT needs a target qubit below.");
        return;
      }

      setMultiSlots(prev => ({
        ...prev,
        [instanceId]: { control: controlIndex, target: targetIndex}
      }));

      setSlots(prev => ({
        ...prev,
        [controlId]: [...prev[controlId], instanceId],
        [targetId]: [...prev[targetId], instanceId]
      }));
      setPending({ lineId: controlId, lineIndex: controlIndex, instanceId: instanceId });
      setShowModal(true);
    }
  }

  function handleMultiQubitConfirm(control: number, target: number) {
    if (!pending) return;

    const instanceId = pending.instanceId;

    // Get old metadata to know which lines to update
    const oldMetadata = multiSlots[instanceId];

    if (!oldMetadata) return;

    // Remove from old lines
    const oldControlId = lines[oldMetadata.control].id;
    const oldTargetId = lines[oldMetadata.target].id;

    setSlots(prev => ({
      ...prev,
      [oldControlId]: prev[oldControlId].filter(id => id !== instanceId),
      [oldTargetId]: prev[oldTargetId].filter(id => id !== instanceId)
    }));

    // Update metadata with new control/target
    setMultiSlots(prev => ({
      ...prev,
      [instanceId]: { control, target }
    }));

    // Add to new lines
    const newControlId = lines[control].id;
    const newTargetId = lines[target].id;

    setSlots(prev => ({
      ...prev,
      [newControlId]: [...prev[newControlId], instanceId],
      [newTargetId]: [...prev[newTargetId], instanceId]
    }));

    setShowModal(false);
    setPending(null);
  }

  function handleModalCancel() {
    setShowModal(false);
    setPending(null);
  }

  function executeCircuit() {
    console.log("slots:", JSON.stringify(slots));
    console.log("multiSlots:", JSON.stringify(multiSlots));
    let currentState: Qubit = [...config.initialState];
    const maxGates = Math.max(...Object.values(slots).map(gates => gates.length), 0);

    // Track WHICH lines have measurement gates, rather than the immediate result
    const measuredBits: number[] = [];

    for (let col = 0; col < maxGates; col++) {
      let colState: Qubit = [...currentState];

      lines.forEach((line, lineIndex) => {
        const gatesOnLine = slots[line.id];
        const gateId = gatesOnLine[col];
        if (!gateId) return;

        const gateType = gateId.split("-")[0];

        if (gateType === "H") {
          colState = applyHadamardToQubit(colState, lineIndex);
        } else if (gateType === "I") {
          colState = applyPauliIToQubit(colState, lineIndex);
        } else if (gateType === "X") {
          colState = applyPauliXToQubit(colState, lineIndex);
        } else if (gateType === "Z") {
          colState = applyPauliZToQubit(colState, lineIndex);
        } else if (gateType === "") {
          colState = applyBarrierToQubit(colState, lineIndex);
        } else if (gateType === "CNOT") {
          const metadata = multiSlots[gateId];
          if (metadata && lineIndex === metadata.control) {
            colState = applyCNOTToQubit(colState, metadata.control, metadata.target);
          }
        } else if (gateType === "T") {
          const metadata = multiSlots[gateId];
          if (metadata && lineIndex === metadata.control && metadata.control2 !== undefined && metadata.control3 !== undefined) {
            colState = applyToffoliToQubit(
              colState,
              metadata.control,
              metadata.control2,
              metadata.control3,
              metadata.target
            )
          }
        } else if (gateType === "M") {
          // We DO NOT collapse colState here. We keep the mathematical state pure
          // so step-by-step verification can properly evaluate superpositions.
          // We only record that this qubit is being measured for the final histogram.
          if (!measuredBits.includes(lineIndex)) {
            measuredBits.push(lineIndex);
          }
        }
      });
      currentState = colState;
    }
    
    currentStateRef.current = currentState;

    // --- IBM 1024 SHOTS HISTOGRAM EMULATION ---
    if (measuredBits.length > 0) {
      const shots = 1024;
      const counts: Record<number, number> = {};

      // 1. Calculate cumulative probabilities from the pure final state
      const cumProbs = new Array(currentState.length).fill(0);
      let sum = 0;
      for (let i = 0; i < currentState.length; i++) {
        // Probability = |amplitude|^2
        sum += currentState[i] * currentState[i]; 
        cumProbs[i] = sum;
      }

      // 2. Run 1024 simulated shots based on those probabilities
      for (let s = 0; s < shots; s++) {
        // Generate a random number between 0 and the total sum (~1.0)
        const rand = Math.random() * sum; 
        
        // Find which basis state this random shot falls into
        let stateIndex = cumProbs.findIndex(p => rand <= p);
        if (stateIndex === -1) stateIndex = currentState.length - 1;

        // 3. Mask out unmeasured qubits (IBM defaults unmeasured to 0 in the UI)
        let finalIndex = 0;
        for (let q = 0; q < config.qubitCount; q++) {
          if (measuredBits.includes(q)) {
            // If the q-th bit is 1 in the collapsed stateIndex, set it in finalIndex
            if ((stateIndex & (1 << q)) !== 0) {
              finalIndex |= (1 << q);
            }
          }
        }

        // Tally the result
        counts[finalIndex] = (counts[finalIndex] || 0) + 1;
      }

      // 4. Create a new state array representing the histogram percentages
      const histogramState = new Array(currentState.length).fill(0);
      for (const [key, count] of Object.entries(counts)) {
        // Your <Probabilities/> component likely plots |amplitude|^2. 
        // To make the bar equal the percentage, we pass the square root.
        histogramState[Number(key)] = Math.sqrt(count / shots);
      }

      setState(histogramState);
    } else {
      // If no measurements exist, just show the theoretical state vector
      setState(currentState);
    }
  }
  // execute everytime a gate is dropped in the slot
  useEffect(() => {
    executeCircuit();
  }, [slots, multiSlots])
  // set circuit preset 
  useEffect(() => {
    if(config.presetSlots) {
      setSlots(config.presetSlots);
    }
  }, [config])
  //
  useEffect(() => {
    if (!selectedFunction || currentVerifyStep === 0) return;
    const result = verifyDeutschStep(currentVerifyStep, currentStateRef.current, selectedFunction);
     // only update on real steps, skip barriers
    if (result !== null) {
      setVerificationResult(result);
    }
  }, [currentVerifyStep, selectedFunction]);

  return (
      <div className="flex flex-col h-full w-full gap-2">
        {/* Upper part */}
        <div className="grid flex-1 grid-cols-[2.3fr_2fr_1.5fr] gap-2">
          <div className="w-full">
            <Probabilities state={state}/>
          </div>
          <div className="w-full">
            <QSphere state = {state} qubitCount = {config.qubitCount} />
          </div>
          {/* Temporary to fillup space (Explanation Box) */}
          <div className="w-full">
            <div className="flex flex-col gap-2 p-4 border border-black/20 rounded-lg bg-white h-full">
              <h3 className="pl-2">Verification</h3>
              <Verification result={verificationResult} currentStep={currentVerifyStep} />
            </div>
          </div>
        </div>
        {/* Lower part */}
        <div className="grid flex-1 grid-cols-[1fr_3.5fr_1fr] gap-2">
          <DndContext onDragEnd={handleDragEnd} >
            {/* Gates */}
            <div className="flex flex-col gap-4 p-4 border border-black/20 rounded-lg  bg-white w-full h-full">
              <h3 className="pl-2 h-8">Gates</h3>
              {/* List of gates 
              e.g. <Gate id="H" name="H"/> */}
              <div className="grid grid-cols-6 grid-rows-4 border border-black/20 rounded-lg p-2 gap-2 h-full">
                {config.allowedGates.map(g => (
                  <Gate key={g} id={g} name={g}/>
                ))}
              </div>
            </div>
            {/* Quantum Circuit */}
            <div className="flex flex-col gap-2 h-full">
              {/* Circuit Builder*/}
              <div ref={circuitContainerRef} className="relative flex-1 gap-4 p-4 border border-black/20 rounded-lg bg-white">
                <h3 className="pl-2">Quantum Circuit</h3>
                <div>
                  {lines.map((line) => (
                    <div key={line.id} ref={element => { lineRefs.current[line.id] = element }}>
                      <Line id={line.id} name={line.name} >
                        {slots[line.id].map((gateId) => {
                          const gateType = gateId.split("-")[0];
                          const metadata = multiSlots[gateId];
                          const currentLineIndex = lines.findIndex(l => l.id === line.id);
                          let displayName = gateType;
                        
                          if (gateType === "CNOT" && metadata) {
                            displayName = (currentLineIndex === metadata.control) ? "●" : "⊕";
                          } 
                          if (gateType === "T" && metadata) {
                            displayName = currentLineIndex === metadata.target ? "⊕" : "●"
                          }
                          if (gateId.startsWith("SPACE")) {
                            return (
                              <div
                                key={gateId}
                                style={{
                                  width: "35px",
                                  height: "35px",
                                  flexShrink: 0,
                                  visibility: "hidden",
                                  pointerEvents: "none",
                                  //border: "1px solid red"
                                }}
                              />
                            )
                          }

                          return (
                            <Gate 
                              key={gateId} 
                              id={gateId} 
                              name={displayName}
                              ref={registerGateRef(gateId, currentLineIndex)}
                            />
                          );
                        })}
                      </Line>
                    </div>
                  ))}
                </div>
                <VerticalLines
                  multiSlots={multiSlots}
                  gateRefs={gateRefs.current}
                  containerRef={circuitContainerRef}
                  lineRefs={lineRefs.current}
                  qubitCount={config.qubitCount}
                />
              </div>
              {/* Circuit Player*/}
              <div className="relative flex items-center justify-center p-4 h-24 border border-black/20 rounded-lg bg-white">
                {/* Reset*/}
                <div onClick={reset} className="absolute top-3 right-3 cursor-pointer">
                  <img src="../../assets/reset.png" alt="Reset" className="h-5 w-5" />
                </div>
                {/* Center Controls */}
                <div className="flex items-center gap-2">
                  <div onClick={stepBack} className="cursor-pointer">
                    <img src="../../assets/stepback.png" alt="Step Back"/>
                  </div>
                  <div onClick={isPlaying ? handlePause : handlePlay} className="cursor-pointer h-8 w-8">
                    {isPlaying 
                      ? <img src="../../assets/pause.png" alt="Pause"/>
                      : <img src="../../assets/play.png" alt="Play" />
                    }
                  </div>
                  <div onClick={stepForward} className="cursor-pointer">
                    <img src="../../assets/stepforward.png" alt="Step Forward"/>
                  </div>
                </div>
              </div>
            </div>
            {/* Temporary to fillup space (OpenQASM Code Viewer) */}
            {/* not necessarily needed inside dndcontext? ata> */}
            <div className="w-full">
              <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center bg-white h-full">
                <h3 className="pl-2">OpenQASM 3.0</h3>
                {/* List of gates */}
                <div className="grid grid-cols-6 grid-rows-4 border border-black/20 rounded-lg p-2 gap-2 h-full">
                </div>
              </div>
            </div>
          </DndContext>
          {showModal && pending && (
            <div>
              <MultiQubitModal
                onClose={handleModalCancel}
                onConfirm={handleMultiQubitConfirm}
                lines={lines}
                currentLine={pending?.lineIndex}
              />
            </div>
          )}
        </div>
      </div>
  )
}
export default Circuit;


