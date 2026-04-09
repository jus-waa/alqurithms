import Layout from '../components/Layout'
import Circuit from '../circuit_builder/Circuit'
import { zeroState } from '../engine/qubit/Qubit';
import type { CircuitConfig } from '../engine/types/CircuitConfig';
import { verifyDeutschJozsaStep } from '../tve_framework/verification/DeutschJozsaVerification';

const deutschJozsaConfig: CircuitConfig = {
  algoName: "Deutsch-Jozsa", 
  qubitCount: 4,
  initialState: zeroState(4),
  allowedGates: ['H', 'I', 'X', 'T', 'M', ''],
};

const steps = [
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "X" },
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
    { lineId: "line-2", gateType: "H" },
    { lineId: "line-3", gateType: "H" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "X" },
    { lineId: "line-1", gateType: "X" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-1", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-2", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-3", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
  ],
  [
    { lineId: "line-0", gateType: "X" },
    { lineId: "line-1", gateType: "X" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "X" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-1", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-2", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-3", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
  ],
  [
    { lineId: "line-0", gateType: "X" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "X" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-1", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-2", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-3", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "X" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-1", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-2", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
    { lineId: "line-3", gateType: "T", meta: { control: 0, control2: 1, control3: 2, target: 3 }},
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
    { lineId: "line-2", gateType: "" },
    { lineId: "line-3", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
    { lineId: "line-2", gateType: "H" },
    { lineId: "line-3", gateType: "I" },
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
];

const DeutschJozsa = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit 
        config={deutschJozsaConfig} 
        steps={steps}
        verifyStep={(step, state) => verifyDeutschJozsaStep(step, state)}/>
      </div>
    </Layout>
  )
}

export default DeutschJozsa