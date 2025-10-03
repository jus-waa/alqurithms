import { useState } from 'react'
import { useDrop } from 'react-dnd'

type DroppedGate = {
  name: string,
  id: number,
}

const Circuit = () => {
  const [slots, setSlots] = useState<DroppedGate[][]>([[], [], [], []]);
  
  return (
    <div className='border border-black/20 rounded-lg'>
      {/* the circuit itself set to 4 rows */}
      {slots.map((row, rowIndex) => {
        const [{isOver}, dropRef] = useDrop(() => ({
          accept: "gate",
          drop: (item : {name: string}) => {
            setSlots((prev) => {
              const newSlots = [...prev];
              newSlots[rowIndex] = [
                ...newSlots[rowIndex],
                { name: item.name, id: Date.now() },
              ];
              return newSlots;
            }
            );
          },
          collect: (monitor) => ({
            isOver: monitor.isOver()
          }),
        }));

        return (
          // the row num 0 1 2 3
          <div
            key={rowIndex}
            ref={dropRef}
            style={{
              display: "grid",
              gridTemplateRows: "repeat(4, 60px)",
              gridTemplateColumns: "repeat(4, 60px)",
              alignItems: "center",
              background: isOver ? "#f7f7f9" : "white",
              height: "80px",
              width: "800px",
              padding: "8px",
              margin: "8px"
            }}
          >
            {/* the row, the actual content (gates itself) */}
            {row.map((gate) => (
              <div
                key={gate.id}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  width: "50px",
                  border: "1px solid rgba(0, 0, 0, 0.2)",
                  borderRadius: "8px",
                  margin: "4px",
                  cursor: "move",
                }}
              >
                {gate.name}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default Circuit