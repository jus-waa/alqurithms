import { useDrop } from 'react-dnd';
import Gate from './gates/Gate';
type DroppedGate = {
  name: string;
  id: number;
  description: string;
  type: string;
};

interface LineProps {
  lineIndex: number;
  onMove: (lineIndex: number, gate: DroppedGate) => void;
  gates: DroppedGate[];
}

const Line = ( {lineIndex, onMove, gates}:LineProps ) => {
  const [ {isOver}, drop ] = useDrop(() => ({
    accept: "gate",
    drop: (item: { name: string, description: string, type: string  }) => {
      onMove(lineIndex, { name: item.name, id: Date.now(), description: item.description, type: item.type });
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    })
  }))
  return (
    <div
      ref={drop}
      style={{
        display: "flex",
        alignItems: "center",
        background: isOver ? "#f7f7f9" : "white",
        height: "80px",
        width: "800px",
        padding: "8px",
        margin: "8px",
        borderRadius: "8px",
        border: "1px solid rgba(0,0,0,0.2)"
      }}
    >
      {gates.map((gate) => (
        <div
          key={gate.id}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70px",
            width: "70px",
            cursor: "move",
          }}
        >
          <Gate name={gate.name} id={gate.id} description={gate.description} type={gate.type}/>
        </div>
      ))}
    </div>
  )
}

export default Line