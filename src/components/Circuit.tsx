import { useDrop } from "react-dnd";
import { useState, useRef, useEffect } from "react";

type DroppedGate = {
  name: string;
  id: number;
};

const Circuit = () => {
  const divRef = useRef<HTMLDivElement>(null);
  const [gates, setGates] = useState<DroppedGate[]>([]);
  const [{ isOver }, dropRef] = useDrop(() => ({
    accept: "Gate", 
    drop: (item: { name: string }) => {
      setGates((prev) => [
        ...prev,
        { name: item.name, id: Date.now() },
      ]);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (divRef.current) {
      dropRef(divRef.current); //attach
    }
  }, [dropRef]);

  return (
    <div 
      ref={divRef}
      style={{
        height: "150px",
        width: "1300px",
        border: "2px dashed gray",
        background: isOver ? "lightgreen" : "white",
        borderRadius: "8px"
      }}
    >
        {gates.map((gate) => (
          <div
            key={gate.id}
            style={{
              border: "1px solid black",
              height: "40px",
              width: "40px",
              padding: "8px",
              margin: "4px",
              background: "lightblue",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            {gate.name}
          </div>
        ))}
    </div>
  );
}

export default Circuit