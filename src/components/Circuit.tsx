import { useEffect, useState } from "react"
import { DndContext} from '@dnd-kit/core'
import Line from "./Line"
import Gate from './Gate'
import Probabilities from "./Probabilities";
import { ket0000 } from "../engine/Qubit";
import { applyHadamardToQubit } from "../engine/gates/Hadamard";
import type { Qubit } from "../engine/Qubit";
import { applyPauliXToQubit } from "../engine/gates/PauliX";
import { applyCNOTtoQubit } from "../engine/gates/CNOT";
import MultiQubitModal from "./MultiQubitModal";
import BlochSphere from "./BlochSphere";
import { applyPauliIToQubit } from "../engine/gates/PauliI";
import { applyPauliZToQubit } from "../engine/gates/PauliZ";

interface Metadata {
  control: number;
  target: number;
}

const Circuit = () => {
  const [state, setState] = useState(ket0000) //meaning start at 0000
  const [slots, setSlots] = useState<Record<string, string[]>> ({
    "line-1": [],
    "line-2": [],
    "line-3": [],
    "line-4": [],
  });
  const [multiSlots, setMultiSlots] = useState<Record<string, Metadata>>({});
  const [pending, setPending] = useState<{lineId: string, lineIndex: number, instanceId: string} | null>(null);
  const [showModal, setShowModal] = useState(false);
  const lines = [
    { id: "line-1", name: "q0" },
    { id: "line-2", name: "q1" },
    { id: "line-3", name: "q2" },
    { id: "line-4", name: "q3" },
  ];

  function handleDragEnd(event) {
    const { active, over } = event;
    const gateType = active.id.split("-")[0];
    if (gateType === "CNOT") {
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
    if (gateType !== "CNOT") {
      return; 
    }
    const isExistingCNOT = multiSlots[active.id];
    const instanceId = isExistingCNOT ? active.id : `CNOT-${Math.random().toString(36).slice(2, 9)}`;
    // if drop outside remove from the old line
    // medyo redundant pero nagana e
    if (!over && isExistingCNOT) {
      const oldControlId = lines[isExistingCNOT.control].id;
      const oldTargetId = lines[isExistingCNOT.target].id;

      setSlots(prev => ({
        ...prev,
        [oldControlId]: prev[oldControlId].filter(id => id !== instanceId),
        [oldTargetId]: prev[oldTargetId].filter(id => id !== instanceId)
      }));

      setMultiSlots(prev => {
        const updated = {...prev};
        delete updated[active.id];
        return updated;
      });
      return;
    }
    // remove from old line if iddrag sa iba
    if (isExistingCNOT) {
      setSlots(prev => ({
        ...prev,
        [isExistingCNOT.control]: prev[isExistingCNOT.control].filter(id => id !== instanceId),
        [isExistingCNOT.target]: prev[isExistingCNOT.target].filter(id => id !== instanceId)
      }));

      setMultiSlots(prev => {
        const updated = {...prev};
        delete updated[active.id];
        return updated;
      });
    }

    // where the user drops the CNOT
    const controlId = over.id;
    // which line it dropped
    const controlIndex = lines.findIndex(line => line.id === controlId);
    // auto set muna target sa baba
    const targetId = lines[controlIndex + 1]?.id;
    const targetIndex = controlIndex + 1;

    if (!targetId) {
      alert("CNOT needs a target qubit below.");
      return;
    }

    setMultiSlots(prev => ({
      ...prev,
      [instanceId]: {
        control: controlIndex,
        target: targetIndex}
    }));

    setSlots(prev => ({
      ...prev,
      [controlId]: [...prev[controlId], instanceId],
      [targetId]: [...prev[targetId], instanceId]
    }));

    setPending({ lineId: controlId, lineIndex: controlIndex, instanceId: instanceId });
    setShowModal(true);
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
    let currentState: Qubit = [...ket0000];
    // get max no. gates on any line
    const maxGates = Math.max(...Object.values(slots).map(gates => gates.length));
    // execute gates column by column
    for (let col = 0; col < maxGates; col++) {
      lines.forEach((line, lineIndex) => {
        const gatesOnLine = slots[line.id];
        if (gatesOnLine[col]) {
          const gateId = gatesOnLine[col]
          const gateType = gatesOnLine[col].split("-")[0];
          if (gateType === "H") {
            currentState = applyHadamardToQubit(currentState, lineIndex);
            console.log('Current state: ', currentState);
          }
          else if (gateType === "I") {
            currentState = applyPauliIToQubit(currentState, lineIndex);
            console.log('Current state: ', currentState);
          }
          else if (gateType === "X") {
            currentState = applyPauliXToQubit(currentState, lineIndex);
            console.log('Current state: ', currentState);
          }
          else if (gateType === "Z") {
            currentState = applyPauliZToQubit(currentState, lineIndex);
            console.log('Current state: ', currentState);
          }
          else if (gateType === "CNOT") {
            const metadata = multiSlots[gateId];
            if (metadata) {
              currentState = applyCNOTtoQubit(currentState, metadata.control, metadata.target);
              console.log(`CNOT gate (C:${metadata.control}, T:${metadata.target}) - Current state: `, currentState);
            }
          }
          // other gates
        }
      });
    }
    setState(currentState)
  }

  // execute everytime a gate is dropped in the slot
  useEffect(() => {
    executeCircuit();
  }, [slots, multiSlots])

  return (
      <div className="flex flex-col h-full w-full gap-2">
        {/* Upper part */}
        <div className="grid flex-1 grid-cols-[2.3fr_2fr_1.5fr] gap-2">
          <div className="w-full">
            <Probabilities state={state}/>
          </div>
          <div className="w-full">
            <BlochSphere />
          </div>
          {/* Temporary to fillup space (Explanation Box) */}
          <div className="w-full">
              <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center bg-white h-full">
                <h3 className="pl-2">Explanation Box</h3>
                {/* List of gates */}
                <div className="grid grid-cols-6 grid-rows-4 border border-black/20 rounded-lg p-2 gap-2 h-full">
                </div>
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
              <div className="grid grid-cols-6 grid-rows-4 border border-black/20 rounded-lg p-2 gap-2 h-full">
                <Gate id="H" name="H"/>
                <Gate id="I" name="I"/>
                <Gate id="X" name="X"/>
                <Gate id="Z" name="Z"/>
                <Gate id="CNOT" name="CNOT"/>
              </div>
            </div>
            {/* Quantum Circuit */}
            <div className="grid gap-2">
              <div className="grid gap-4 p-4 border border-black/20 rounded-lg bg-white">
                <h3 className="pl-2">Quantum Circuit</h3>
                <div>
                  {lines.map((line) => (
                  <Line key={line.id} id={line.id} name={line.name}>
                    {slots[line.id].map((gateId) => {
                      const gateType = gateId.split("-")[0];
                      const metadata = multiSlots[gateId];
                      let displayName = gateType;
                      if (gateType === "CNOT" && metadata) {
                        const currentLineIndex = lines.findIndex(l => l.id === line.id);
                        if (currentLineIndex === metadata.control) {
                          displayName = ".";
                        } else {
                          displayName = "⊕";
                        }
                      }
                      return (
                        <Gate 
                          key={gateId} 
                          id={gateId} 
                          name={displayName}
                        />
                      );
                    })}
                  </Line>
                ))}
                </div>
              </div>
              <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center bg-white">
                Player
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


