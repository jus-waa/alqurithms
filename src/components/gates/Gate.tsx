import { useDrag } from 'react-dnd';

const Gate = ({ name } : {name: string}) => {
  const [{isDragging}, dragRef] = useDrag(() => ({
    type: "gate",
    item: {name},
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    })
  }))

  return (
    <div  
      ref={dragRef}
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