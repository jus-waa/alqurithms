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
import { measureQubit } from "../engine/gates/Measurement.ts";
import useCircuitPlayer from "../tve_framework/trace/CircuitPlayer";
import type { CircuitConfig } from "../engine/types/CircuitConfig";
import type { Qubit } from "../engine/qubit/Qubit";
import VerticalLines from "../tve_framework/trace/VerticalLines";
import type { VerificationResult } from "../tve_framework/verification/DeutschVerification.ts";
import Verification from "../tve_framework/verification/Verification";
import Explanation from "../tve_framework/explanation/Explanation.tsx";
import type { ExplanationResult } from "../tve_framework/explanation/DeutschExplanation.ts";
import type { OpenQASMResult } from "../tve_framework/explanation/openQASM/DeutschOpenQASM.ts";
import OpenQASM from "../tve_framework/explanation/openQASM/OpenQASM.tsx";

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
  verifyStep?: (step: number, state: Qubit) => VerificationResult | null;
  explainStep?: (step: number) => ExplanationResult | null;
  openQASMStep?: (step: number) => OpenQASMResult | null;
  onStepChange?: (step: number) => Promise<void> | void;
}

const Circuit = ( {config, steps, verifyStep, explainStep, openQASMStep, onStepChange }:CircuitProps) => {
  const [state, setState] = useState(config.initialState) //e.g. ket0000 = 0000
  const [slots, setSlots] = useState<Record<string, string[]>> (
    Object.fromEntries(
      Array.from({ length: config.qubitCount }, (_, i) => [`line-${i}`, []])
    )
  );
  const [multiSlots, setMultiSlots] = useState<Record<string, Metadata>>({});
  const [pending, setPending] = useState<{lineId: string, lineIndex: number, instanceId: string} | null>(null);
  const [showModal, setShowModal] = useState(false);  

  const [QASMResult, setQASMResult] = useState<OpenQASMResult | null>(null);
  const [explanationResult, setExplanationResult] = useState<ExplanationResult | null>(null);
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
    //console.log("slots:", JSON.stringify(slots));
    //console.log("multiSlots:", JSON.stringify(multiSlots));
    // console.log("=== Initial State ===");
    // config.initialState.forEach((amp, i) => {
    //   console.log(`|${i.toString(2).padStart(config.qubitCount, '0')}⟩ : ${amp.toFixed(5)}`);
    // });
    const initNonZero = config.initialState
      .map((amp, i) => ({ i, amp }))
      .filter(({ amp }) => Math.abs(amp) > 0.0001)
      .map(({ i, amp }) => `|${i.toString(2).padStart(config.qubitCount, '0')}⟩:${amp.toFixed(3)}`)
      .join("  ");
    console.log(`=== Initial State === ${initNonZero}`);
    let currentState: Qubit = [...config.initialState];
    const maxGates = Math.max(...Object.values(slots).map(gates => gates.length), 0);

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
            );
          }
        } else if (gateType === "M") {
          if (!measuredBits.includes(lineIndex)) {
            measuredBits.push(lineIndex);
          }
        }
        // console.log(`Step ${col}, Gate: ${gateType} on line ${lineIndex}`);
        // colState.forEach((amp, i) => {
        //   console.log(`|${i.toString(2).padStart(config.qubitCount, '0')}⟩ : ${amp.toFixed(5)}`);
        // });
      });
      currentState = colState;
      const nonZero = currentState
        .map((amp, i) => ({ i, amp }))
        .filter(({ amp }) => Math.abs(amp) > 0.0001)
        .map(({ i, amp }) => `|${i.toString(2).padStart(config.qubitCount, '0')}⟩:${amp.toFixed(3)}`)
        .join("  ");
      console.log(`Step ${col}: ${nonZero || "(all zero)"}`);
    }
    currentStateRef.current = currentState;
    if (measuredBits.length > 0) {
      const measuredState = measureQubit(currentState, measuredBits, config.qubitCount);
      currentStateRef.current = measuredState;

      console.group(`%c⟨ψ| Statevector — ${config.qubitCount} qubits`, 'color: #6929c4; font-weight: bold; font-size: 13px');
      currentStateRef.current.forEach((amp, i) => {
        const label = `|${i.toString(2).padStart(config.qubitCount, '0')}⟩`;
        const prob = (amp * amp * 100).toFixed(2);
        const bar = '█'.repeat(Math.round(amp * amp * 20));
        if (Math.abs(amp) > 0.0001) {
          console.log(`%c${label}  %camp: ${amp.toFixed(5)}  %cprob: ${prob}%  ${bar}`,
            'color: #78a9ff; font-family: monospace',
            'color: #a8a8a8',
            'color: #42be65'
          );
        }
      });
      console.groupEnd();
      setState(measuredState);
    } else {
      console.group(`%c⟨ψ| Statevector — ${config.qubitCount} qubits`, 'color: #6929c4; font-weight: bold; font-size: 13px');
      currentStateRef.current.forEach((amp, i) => {
        const label = `|${i.toString(2).padStart(config.qubitCount, '0')}⟩`;
        const prob = (amp * amp * 100).toFixed(2);
        const bar = '█'.repeat(Math.round(amp * amp * 20));
        if (Math.abs(amp) > 0.0001) {
          console.log(`%c${label}  %camp: ${amp.toFixed(5)}  %cprob: ${prob}%  ${bar}`,
            'color: #78a9ff; font-family: monospace',
            'color: #a8a8a8',
            'color: #42be65'
          );
        }
      });
      console.groupEnd();
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
  // verification, explanation
  useEffect(() => {
    if (!verifyStep || !explainStep || !openQASMStep) return; 
    const verifyResult = verifyStep(currentVerifyStep, currentStateRef.current);
    const explainResult = explainStep(currentVerifyStep);
    const QASMResult = openQASMStep(currentVerifyStep);

    console.log("Verification:", verifyResult);
    console.log("Explanation:", explainResult);
    console.log("OpenQASM:", QASMResult);
     // only update on real steps, skip barriers
    if (verifyResult !== null || explainResult !== null || QASMResult) {
      setVerificationResult(verifyResult);
      setExplanationResult(explainResult);
      setQASMResult(QASMResult);
    }
  }, [currentVerifyStep, verifyStep, explainStep, openQASMStep]);

  return (
      <div className="flex flex-col h-full w-full gap-2">
        {/* Upper part */}
        <div className="grid flex-1 grid-cols-[2.3fr_2fr_1.5fr] gap-2">
          <div className="w-full">
            <Probabilities state={state}/>
          </div>
          {/* Q SPhere */}
          <div className="w-full">
            <QSphere state = {state} qubitCount = {config.qubitCount} />
          </div>
          {/* Explanation Box */}
          <div className="grid grid-cols-1 grid-rows-2 gap-2 p-4 border border-black/20 rounded-lg bg-white">
              <div>
                <h3 className="pl-2 pb-4">Explanation</h3>
                <Explanation result={explanationResult} currentStep={currentVerifyStep}/>
              </div>
              <div>
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
              {/* List of gates */}
              <div className="grid grid-cols-6 grid-rows-8 border border-black/20 rounded-sm p-2 gap-2 h-full">
                {config.allowedGates.map(g => {
                  let displayName = g;
                  if (g === "CNOT") displayName = "⊕";
                  return <Gate key={g} id={g} name={displayName}/>
                })}
              </div>
            </div>
            {/* Quantum Circuit */}
            <div className="flex flex-col gap-2 h-full">
              {/* Circuit Builder*/}
              <div ref={circuitContainerRef} className="relative h-90 gap-4 p-4 border border-black/20 rounded-lg bg-white">
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
              <div className="relative flex flex-1 items-center justify-center p-4 h-24 border border-black/20 rounded-lg bg-white">
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
            {/* OpenQASM Code Viewer */}
            <div className="flex flex-col gap-2 p-4 border border-black/20 rounded-lg bg-white">
              <div className="w-full h-90 min-h-0">
                <h3 className="pl-2 pb-4">OpenQASM Code Viewer</h3>
                <OpenQASM result={QASMResult} currentStep={currentVerifyStep} />
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


