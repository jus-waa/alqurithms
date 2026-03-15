import { useState, useRef } from 'react';
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

const steps = [
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
  ],
  [
    { lineId: "line-0", gateType: "H" },
    { lineId: "line-1", gateType: "H" },
  ]
];

const Deutsch = () => {
  const [showOracleModal, setShowOracleModal] = useState(false);
  const resolveRef = useRef<(() => void) | null>(null);

  async function handleStep(step: number) {
    if (step === 1) {
      setShowOracleModal(true);

      // pause until function is chosen
      await new Promise<void>((resolve) => {
        resolveRef.current = resolve;
      });
    }
  }
  
  function choose(type: string) {
    setShowOracleModal(false);

    if (resolveRef.current) {
      resolveRef.current();
      resolveRef.current = null;
    }
  }
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={deutschConfig} steps={steps} onStepChange={handleStep}/>
          {showOracleModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/50 border z-20">
              <div className="bg-white p-6 rounded-lg flex flex-col gap-3 z-10 border">
                <div className="modal">
                  <button onClick={() => choose("f0")} className='border p-2 m-2 cursor-pointer'> f(x)=0 </button>
                  <button onClick={() => choose("f1")} className='border p-2 m-2 cursor-pointer'> f(x)=1 </button>
                  <button onClick={() => choose("fx")} className='border p-2 m-2 cursor-pointer'> f(x)=x </button>
                  <button onClick={() => choose("notx")} className='border p-2 m-2 cursor-pointer'> f(x)=¬x </button>
                </div>
              </div>
            </div>
          )}
      </div>
    </Layout>
  )
}

export default Deutsch