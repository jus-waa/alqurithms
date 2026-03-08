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

const BernsteinVazirani = () => {
  return (
    <Layout>
      <div className='h-full w-full'>
        <Circuit config={bernsteinVaziraniConfig}/>
      </div>
    </Layout>
  )
}

export default BernsteinVazirani