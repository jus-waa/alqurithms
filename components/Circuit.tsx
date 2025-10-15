import { useState } from 'react';
import Line from './Line';

type DroppedGate = {
  name: string;
  id: number;
  description: string;
  type: string;
};

const Circuit = () => {
  const [lines, setLines] = useState<DroppedGate[][]>([[], [], [], []]);
  const handleDropGate = (lineIndex: number, gate: DroppedGate) => {
    setLines((prev) => {
      const newLines = [...prev];
      newLines[lineIndex] = [...newLines[lineIndex], gate];
      return newLines;
    });
  };

  return (
    <div className="border border-black/20 rounded-lg p-4">
      <h2 className="mb-2 ml-2">Quantum Circuit</h2>

      {lines.map((gates, index) => (
        <Line
          key={index}
          lineIndex={index}
          onDropGate={handleDropGate}
          gates={gates}
        />
      ))}
    </div>
  )
}

export default Circuit