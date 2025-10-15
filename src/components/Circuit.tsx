import { useState } from "react"
import { DndContext } from '@dnd-kit/core'
import Line from "./Line"
import Gate from '../components/gates/Gate'

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

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;
    
    setSlots((prev) => ({
      ...prev,
      [over.id]: [...prev[over.id], active.id], 
    }));
  };

  return (
    <>
      <div className="flex gap-6">
        <DndContext onDragEnd={handleDragEnd}>
          {/* Gates */}
          <div className="border border-black/20 p-6 rounded-lg h-90 w-90">
            <div className="text-center border border-black/20 p-6 rounded-lg mb-6">Gates</div>
            {/* List of gates */}
            <div className="border border-black/20 rounded-lg p-4 h-48 w-48">
              <Gate id="H" name="H"></Gate>
            </div>
          </div>
          {/* Qubit Line */}
          <div className="border border-black/20 p-6 rounded-lg ">
            <h2 className="mb-2 ml-2">Quantum Circuit</h2>
            {lines.map((line) => (
              <Line key={line.id} id={line.id} name={line.name}>
                {slots[line.id].map((gateId, i) => (
                  <Gate key={gateId + i} id={gateId + i} name={gateId} />
                ))} 
              </Line>
            ))}
          </div>
        </DndContext>
      </div>
      
    </>
  )
}

export default Circuit
