import { useState, useRef } from 'react';
import Layout from '../components/Layout'
import Circuit from '../circuit_builder/Circuit'
import { zeroState } from '../engine/qubit/Qubit';
import type { CircuitConfig } from '../engine/types/CircuitConfig';
import { verifyDeutschStep, type DeutschFunction } from '../tve_framework/verification/DeutschVerification';

const deutschConfig: CircuitConfig = {
  algoName: "Deutsch", 
  qubitCount: 2,
  initialState: zeroState(2),
  allowedGates: ["H", "I", "X", "Z", "CNOT", "M", ""],
};

const Deutsch = () => {
  const [selectedFunction, setSelectedFunction] = useState<DeutschFunction>("f0");
  const [showOracleModal, setShowOracleModal] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);
  const initialSteps = useRef([
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "X" },
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
  ],
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
  ],
  //oracle
  [
    { lineId: "line-0", gateType: "" },
    { lineId: "line-1", gateType: "" },
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "I" },
  ],
  [
    { lineId: "line-0", gateType: "M" },
  ]
]);
  const [steps, setSteps] = useState(initialSteps.current);

  async function handleStep(step: number) {
    if (step === 3) {
      setShowOracleModal(true);

      // pause until function is chosen
      await new Promise<void>((resolve) => {
        resolveRef.current = resolve;
      });
    }
  }
  
  function choose(type: string) {
    setSelectedFunction(type as DeutschFunction);
    setShowOracleModal(false);
    let oracleGateStep: { 
      lineId: string;
      gateType: string;
      meta?: {
        control: number;
        target: number;
      }
    }[][] = [];

    if(type === "f0") {
      oracleGateStep = [
        [
          { lineId: "line-0", gateType: "I" },
          { lineId: "line-1", gateType: "I" },
        ]
      ];
      console.log(oracleGateStep);
    } else if(type === "f1") {
      oracleGateStep = [
        [
          { lineId: "line-0", gateType: "CNOT", meta: { control: 0, target: 1 } },
          { lineId: "line-1", gateType: "CNOT", meta: { control: 0, target: 1 } },
        ]
      ];
      console.log(oracleGateStep);
    } else if(type === "f2") {
      oracleGateStep = [
        [
          { lineId: "line-0", gateType: "Z" },
          { lineId: "line-1", gateType: "I" },
        ],
        [
          { lineId: "line-0", gateType: "CNOT", meta: { control: 0, target: 1 } },
          { lineId: "line-1", gateType: "CNOT", meta: { control: 0, target: 1 } },
        ],
        [
          { lineId: "line-0", gateType: "Z" },
          { lineId: "line-1", gateType: "I" },
        ]
      ];
    } else if(type === "f3") {
      oracleGateStep = [
        [
          { lineId: "line-0", gateType: "I" },
          { lineId: "line-1", gateType: "Z" },
        ]
      ];
    }

    setSteps([
      initialSteps.current[0],
      initialSteps.current[1],
      initialSteps.current[2],
      ...oracleGateStep,
      initialSteps.current[3],
      initialSteps.current[4],
      initialSteps.current[5],
    ]);

    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit 
          config={deutschConfig} 
          steps={steps} 
          onStepChange={handleStep} 
          verifyStep={(step, state) => verifyDeutschStep(step, state, selectedFunction)}/>
          {showOracleModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 border z-20">
              <div className="bg-white p-6 rounded-lg flex flex-col gap-3 z-10 border">
                <div className="modal">
                  <button onClick={() => choose("f0")} className='border p-2 m-2 cursor-pointer'> f(x)=0 </button>
                  <button onClick={() => choose("f1")} className='border p-2 m-2 cursor-pointer'> f(x)=1 </button>
                  <button onClick={() => choose("f2")} className='border p-2 m-2 cursor-pointer'> f(x)=2 </button>
                  <button onClick={() => choose("f3")} className='border p-2 m-2 cursor-pointer'> f(x)=3 </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </Layout>
  )
}

export default Deutsch