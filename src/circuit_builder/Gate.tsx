import { useDraggable } from "@dnd-kit/core";
import { forwardRef } from "react";

interface GateProps {
  id: string;
  name: string;
}

const Gate = forwardRef<HTMLDivElement, GateProps>(({ id, name }, ref) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = {
    transform: transform 
    ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
    : undefined,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    padding: "4px",
    height: "35px",
    width: "35px",
    cursor: "grab",
    zIndex: "10",
    position: "relative" as const,
  };
  
  const mergeRefs = (e: HTMLDivElement | null) => {
    setNodeRef(e)
    if (typeof ref === "function") {
      ref(e)
    } else if (ref) {
      ref.current = e;
    }
  } 

  return (
    <>
      <div 
        ref={mergeRefs} 
        style={style} {...listeners} {...attributes}> 
        {name}
      </div>
    </>
  );
})

Gate.displayName = "Gate"
export default Gate;
