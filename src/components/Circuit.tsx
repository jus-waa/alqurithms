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

  const Circuit = () => {
    const [state, setState] = useState(ket0000) //meaning start at 0000
    const [slots, setSlots] = useState<Record<string, string[]>> ({
      "line-1": [],
      "line-2": [],
      "line-3": [],
      "line-4": [],
    });
    const [multiSlots, setMultiSlots] = useState<Record<string, {controlLine: string, targetLine: string, column: number}>>({});
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
        //if gate exist then remove from the old line
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
      if (gateType !== "CNOT") return;

      const isExistingCNOT = multiSlots[active.id];
      const instanceId = isExistingCNOT ? active.id : `CNOT-${Math.random().toString(36).slice(2, 9)}`;

      // if drop outside remove from the old line
      // medyo redundant pero nagana e
      if (!over && isExistingCNOT) {
        setSlots(prev => ({
          ...prev,
          [isExistingCNOT.controlLine]: prev[isExistingCNOT.controlLine].filter(id => id !== instanceId),
          [isExistingCNOT.targetLine]: prev[isExistingCNOT.targetLine].filter(id => id !== instanceId)
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
          [isExistingCNOT.controlLine]: prev[isExistingCNOT.controlLine].filter(id => id !== instanceId),
          [isExistingCNOT.targetLine]: prev[isExistingCNOT.targetLine].filter(id => id !== instanceId)
        }));

        setMultiSlots(prev => {
          const updated = {...prev};
          delete updated[active.id];
          return updated;
        });
      }
      
      // where the user drops the CNOT
      const controlLine = over.id;
      // which line it dropped
      const controlLineIndex = lines.findIndex(line => line.id === controlLine);
      // auto set muna target sa baba
      const targetLine = lines[controlLineIndex + 1]?.id;
      if (!targetLine) {
        alert("CNOT needs a target qubit below.");
        return;
      }
      const column = slots[controlLine].length; 

      setMultiSlots(prev => ({
        ...prev,
        [instanceId]: {controlLine, targetLine, column}
      }));

      setSlots(prev => ({
        ...prev,
        [controlLine]: [...prev[controlLine], instanceId],
        [targetLine]: [...prev[targetLine], instanceId]
      }));
    }

    function executeCircuit() {
      let currentState: Qubit = [...ket0000];
      // get max no. gates on any line
      const maxGates = Math.max(...Object.values(slots).map(gates => gates.length));
      const processedCNOT = new Set<string>();
      // execute gates column by column
      for (let col = 0; col < maxGates; col++) {
        lines.forEach((line, lineIndex) => {
          const gatesOnLine = slots[line.id];

          if (gatesOnLine[col]) {
            const gateId = gatesOnLine[col]
            const gateType = gatesOnLine[col].split("-")[0];
            // hadamard 
            if (gateType === "H") {
              currentState = applyHadamardToQubit(currentState, lineIndex);
              console.log('Current state: ', currentState);
            }
            else if (gateType === "X") {
              currentState = applyPauliXToQubit(currentState, lineIndex);
              console.log('Current state: ', currentState);
            }
            else if (gateType === "CNOT" && !processedCNOT.has(gateId)) {
              // proces ONCE lang 
              const CNOTGate = multiSlots[gateId];
              if (CNOTGate && CNOTGate.controlLine === line.id) {
                const controlIndex = lines.findIndex(l => l.id === CNOTGate.controlLine);
                const targetIndex = lines.findIndex(l => l.id === CNOTGate.targetLine);

                currentState = applyCNOTtoQubit(currentState, controlIndex, targetIndex)
                processedCNOT.add(gateId);
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
    }, [slots])

    return (
      <>
        <DndContext onDragEnd={handleDragEnd}>
          {/* Gates */}
          <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center bg-white">
            <h3 className="pl-2">Gates</h3>
            {/* List of gates */}
            <div className="grid grid-cols-6 grid-rows-4 border border-black/20 rounded-lg p-2 gap-2 h-full">
              <Gate id="H" name="H"/>
              <Gate id="X" name="X"/>
              <Gate id="CNOT" name="CNOT"/>
            </div>
          </div>
          {/* Qubit Line */}
          <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center bg-white">
            <h3 className="pl-2">Quantum Circuit</h3>
            <div>
              {lines.map((line) => (
              <Line key={line.id} id={line.id} name={line.name}>
                {slots[line.id].map((gateId) => {
                  const gateType = gateId.split("-")[0];
                  const CNOTGate = multiSlots[gateId];

                  let displayName = gateType;
                  if (gateType === "CNOT" && CNOTGate) {
                    if (line.id === CNOTGate.controlLine) {
                      displayName = ".";
                    } else {
                      displayName = "⊕";
                    }
                  }

                  return (
                    <Gate key={gateId} id={gateId} name={displayName}/>
                  );
                })}
              </Line>
            ))}
            </div>
          </div>
          <div>
            <Probabilities state={state}/>
          </div>
        </DndContext>
      </>
    )
  }

  export default Circuit
