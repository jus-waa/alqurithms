import { useDrag } from 'react-dnd';

interface GateProps{
  id: number;
  name: string;
  description: string;
  type: string;
  lineIndex?: number; // ? means optional
}

const Gate = ( {id, name, description, type, lineIndex }: GateProps) => {
  const [{isDragging}, drag] = useDrag(() => ({
    type: "gate",
    item: {id, name, description, type, fromLine: lineIndex},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }))

  return (
    <div  
      ref={drag}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        opacity: isDragging ? 0.4 : 1,
        height: "50px",
        width: "50px",
        border: "1px solid rgba(0, 0, 0, 0.2)",
        borderRadius: "8px",
        margin: "4px",
        cursor: "move",
      }}
    > 
    {name}
    </div>
  )
}

export default Gate