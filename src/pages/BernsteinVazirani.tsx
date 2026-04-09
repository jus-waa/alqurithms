import Layout from '../components/Layout'
import Circuit from '../circuit_builder/Circuit'
import { zeroState } from '../engine/qubit/Qubit';
import type { CircuitConfig } from '../engine/types/CircuitConfig';
import { verifyBernsteinVaziraniStep } from '../tve_framework/verification/BernsteinVaziraniVerification';

const bernsteinVaziraniConfig: CircuitConfig = {
  algoName: "Bernstein-Vazirani", 
  qubitCount: 5,
  initialState: zeroState(5),
  allowedGates: ['H', 'I', 'X', 'CNOT', 'M', ''],
};
const secret = "1101";
const steps = [
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
    { lineId: "line-4", gateType: "X" },
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
    { lineId: "line-2", gateType: "H" },
    { lineId: "line-3", gateType: "H" },
    { lineId: "line-4", gateType: "H" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
    { lineId: "line-4", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "CNOT", meta: { control: 0, target: 4 }},
    { lineId: "line-4", gateType: "CNOT", meta: { control: 0, target: 4 }},
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
    { lineId: "line-4", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "CNOT", meta: { control: 2, target: 4 }},
    { lineId: "line-4", gateType: "CNOT", meta: { control: 2, target: 4 }},
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
    { lineId: "line-4", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "CNOT", meta: { control: 3, target: 4 }},
    { lineId: "line-4", gateType: "CNOT", meta: { control: 3, target: 4 }},
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
    { lineId: "line-2", gateType: "H" },
    { lineId: "line-3", gateType: "H" },
    { lineId: "line-4", gateType: "I" },
  ],
  [
    { lineId: "line-0", gateType: "M" },
  ],
  [
    { lineId: "line-1", gateType: "M" },
  ],
  [
    { lineId: "line-2", gateType: "M" },
  ],
  [
    { lineId: "line-3", gateType: "M" },
  ],
];

const BernsteinVazirani = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit 
          config={bernsteinVaziraniConfig} 
          steps={steps}
          verifyStep={(step, state) => verifyBernsteinVaziraniStep(step, state, secret)}/>
      </div>
    </Layout>
  )
}

export default BernsteinVazirani