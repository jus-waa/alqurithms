import { useState } from "react"
import { DndContext} from '@dnd-kit/core'
import Line from "./Line"
import Gate from './Gate'

const Circuit = () => {
  const [slots, setSlots] = useState<Record<string, string[]>> ({
    "line-1": [],
    "line-2": [],
    "line-3": [],
    "line-4": [],
  });

  const lines = [
    { id: "line-1", name: "q0" },
    { id: "line-2", name: "q1" },
    { id: "line-3", name: "q2" },
    { id: "line-4", name: "q3" },
  ];

  function handleDragEnd(event) {
    const { active, over } = event;

    setSlots((prev) => {
      let qubitLine: string | null = null;
      // checks if gate is already in circuit
      for (const line in prev) {
        if (prev[line].includes(active.id)) {
          qubitLine = line;
          break; 
        }
      }
      // check if its a new instance or existing
      const isExisting = !!qubitLine;
      const instanceId = isExisting ? active.id : `${active.id}-${Math.random().toString(36).slice(2, 9)}`;
      // latest state
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
      // check if gate exist then remove from the old line
      if (isExisting && qubitLine && updated[qubitLine]) {
        updated[qubitLine] = updated[qubitLine].filter((id) => id !== instanceId); 
      }
      // add to the new line if its still not there
      if (!updated[over.id].includes(instanceId)) {
        updated[over.id] = [...updated[over.id], instanceId];
      }
      return updated;
    });
  }

  return (
    <>
      <DndContext onDragEnd={handleDragEnd}>
        {/* Gates */}
        <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center">
          <div className="pl-2">Gates</div>
          {/* List of gates */}
          <div className="grid grid-cols-6 grid-rows-4 border border-black/20 rounded-lg p-2 gap-2 h-full">
            <Gate id="H" name="H"/>
            <Gate id="Y" name="Y"/>
            <Gate id="X" name="X"/>
          </div>
        </div>
        {/* Qubit Line */}
        <div className="grid gap-4 p-4 border border-black/20 rounded-lg place-content-center">
          <h2 className="pl-2">Quantum Circuit</h2>
          <div>
            {lines.map((line) => (
            <Line key={line.id} id={line.id} name={line.name}>
              {slots[line.id].map((gateId) => (
                <Gate key={gateId} id={gateId} name={gateId.split("-")[0]}/>
              ))}
            </Line>
          ))}
          </div>
        </div>
      </DndContext>
    </>
  )
}

export default Circuit
