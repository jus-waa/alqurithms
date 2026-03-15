import Layout from '../components/Layout'
import Circuit from '../components/Circuit'
import { zeroState } from '../engine/Qubit';
import type { CircuitConfig } from '../engine/types/CircuitConfig';

const deutschJozsaConfig: CircuitConfig = {
  algoName: "Deutsch-Jozsa", 
  qubitCount: 4,
  initialState: zeroState(4),
  allowedGates: ['H', 'I', 'X', 'Z'],
};

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

const DeutschJozsa = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={deutschJozsaConfig} steps={steps}/>
      </div>
    </Layout>
  )
}

export default DeutschJozsa