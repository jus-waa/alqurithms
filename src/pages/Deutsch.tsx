import Layout from '../components/Layout'
import Circuit from '../components/Circuit'
import { zeroState } from '../engine/Qubit';
import type { CircuitConfig } from '../engine/types/CircuitConfig';

const deutschConfig: CircuitConfig = {
  algoName: "Deutsch", 
  qubitCount: 2,
  initialState: zeroState(2),
  allowedGates: ['H', 'I', 'X', 'Z'],
};

// steps used by circuit player
  const steps = [
    [
      { lineId: "line-0", gateType: "H" },
      { lineId: "line-1", gateType: "H" },
    ],
    [
      { lineId: "line-0", gateType: "I" },
      { lineId: "line-1", gateType: "I" },
    ],
    [
      { lineId: "line-0", gateType: "H" },
      { lineId: "line-1", gateType: "H" },
    ]
  ];

const Deutsch = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={deutschConfig} steps={steps}/>
      </div>
    </Layout>
  )
}

export default Deutsch