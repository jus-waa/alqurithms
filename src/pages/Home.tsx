import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Home = () => {
  return (
    <Layout>
      <section className="flex flex-col justify-center items-center text-center bg-white border border-red-500 p-6 h-24 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">
          Trace-Verify-Explain 
        </h1>
        <p className="font-normal max-w-2xl mb-4">
          The platform presents the Trace-Verification-Explanation (TVE) framework for quantum algorithm simulation. Tracing the step-by-step evolution of quantum states, verification of each step, and explanation of each stage.        
        </p>
        <Link
          to="/algorithms"
          className='border border-black/20 px-4 py-2 rounded-lg cursor-pointer'
        >
          Getting Started
        </Link>
      </section>
    </Layout>
  );
}

export default Home
