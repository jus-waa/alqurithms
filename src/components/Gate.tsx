import { useDraggable } from "@dnd-kit/core";

interface GateProps {
  id: string;
  name: string;
}

const Gate = ({id, name}: GateProps) => {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({ 
    id,
  });
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined,
    display: "flex",
    justifyContent: "center",
    backgroundColor: "white",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    padding: "4px",
    height: "35px",
    width: "35px",
    cursor: "grab",
    zIndex: "10",
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} {...listeners} {...attributes}> 
        {name}
      </div>
    </>
  );
}

export default Gate
