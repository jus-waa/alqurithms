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

const DeutschJozsa = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={deutschJozsaConfig}/>
      </div>
    </Layout>
  )
}

export default DeutschJozsa