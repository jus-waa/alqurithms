import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Home = () => {
  return (
    <Layout>
      <section className="flex flex-col justify-center items-center text-center bg-white border border-black/20 p-6 h-full rounded-lg">
        <h1 className="text-3xl font-bold mb-4">
          Process-Oriented Quantum Algorithm Simulation
        </h1>
        <p className="font-normal max-w-2xl mb-4">
          Execute and observe quantum algorithms through structured state transformations. The platform presents the step-by-step evolution of quantum states, enabling trace, verification, and explanation of each operation within the circuit.
        </p>
        <Link
          to="/algorithms"
          className='border border-black/20 px-4 py-2 rounded-lg cursor-pointer'
        >
          Proceed to Simulation
        </Link>
      </section>
    </Layout>
  );
}

export default Home
