import { useDroppable } from "@dnd-kit/core";

interface LineProps {
  id: string;
  name: string;
  children: React.ReactNode;
}

const Line = ( {id, name, children}: LineProps ) => {
  const {isOver, setNodeRef} = useDroppable({ id });
  const style = {
    opacity: isOver ? '0.4' : 1,
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px",
    height: "50px",
    width: "auto",
  }

  return (
    <>
      <div className="flex flex-col m-2 px-6">
        <div ref={setNodeRef} style={style}>
          {/* q0 q1 q2 q3 */}
          <span className="p-3 bg-white z-10">{name}</span>
          {/* line */}
          <div className="absolute border-t border-black/20 w-full z-0" />
          {/* ocntent */}
          <div className="flex gap-2">
            {children}
          </div>      
        </div>
      </div>
    </>
  )
}

export default Line
