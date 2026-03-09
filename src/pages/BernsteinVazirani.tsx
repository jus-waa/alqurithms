import Layout from '../components/Layout'
import Circuit from '../components/Circuit'
import { zeroState } from '../engine/Qubit';
import type { CircuitConfig } from '../engine/types/CircuitConfig';

const bernsteinVaziraniConfig: CircuitConfig = {
  algoName: "Bernstein-Vazirani", 
  qubitCount: 5,
  initialState: zeroState(5),
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

const BernsteinVazirani = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={bernsteinVaziraniConfig} steps={steps}/>
      </div>
    </Layout>
  )
}

export default BernsteinVazirani