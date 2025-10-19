import { useDroppable } from "@dnd-kit/core";

interface GateProps {
  id: string;
  name: string;
  children: React.ReactNode;
}

const Line = ( {id, name, children}:GateProps ) => {
  const {isOver, setNodeRef} = useDroppable({ id });
  const style = {
    opacity: isOver ? '0.4' : 1,
    display: "flex",
    alignItems: "center",
    gap: "6px",
    border: "1px solid rgba(0, 0, 0, 0.2)",
    borderRadius: "8px",
    padding: "4px",
    height: "50px",
    width: "700px",
  }

  return (
    <>
      <div className="flex flex-col m-2">
      <div ref={setNodeRef} style={style}>
        <span className="m-2">{name}</span>
        <div className="flex gap-2">{children}</div>      </div>
    </div>
    </>
  )
}

export default Line
