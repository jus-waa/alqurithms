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

const Deutsch = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={deutschConfig}/>
      </div>
    </Layout>
  )
}

export default Deutsch