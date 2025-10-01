import { useDrag } from "react-dnd";
import { useRef, useEffect } from "react";

const Gate = ({ name }: {name: string}) => {
  const divRef = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, dragRef] = useDrag(() => ({
    type: "Gate",
    item: { name },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (divRef.current) {
      dragRef(divRef.current)
    }
  }, [dragRef]);

  return (
    <div
      ref={divRef}
      style={{
        opacity: isDragging ? 0.5 : 1,
        height: "40px",
        width: "40px",
        border: "1px solid black",
        padding: "8px",
        margin: "4px",
        background: "lightblue",
        cursor: "move",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      {name}
    </div>
  )
}

export default Gate