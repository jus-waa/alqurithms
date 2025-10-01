import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Home = () => {
  return (
    <Layout>
      <section className="flex flex-1 flex-col justify-center items-center text-center border border-black/20 p-6 rounded-lg">
        <h1 className="text-5xl font-bold mb-4">
          Foundational Quantum Algorithms.
        </h1>
        <p className="text-xl font-normal max-w-2xl mb-4">
          Explore the foundational quantum algorithms through interactive visuals. Run simulations, build circuits, and understand algorithms with hands-on guidance.
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
