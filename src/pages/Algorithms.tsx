import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Algorithms = () => {
  return (
    <Layout>
      <div className='h-full'>
        <div className='grid grid-cols-3 p-40 gap-6 border border-black/20 rounded-lg bg-white h-full'>
          <Link to="/deutsch" className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg bg-white'>
            Deutsch Algorithm
          </Link>
          <Link to="/deutsch" className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg bg-white'>
            Deutsch-Jozsa Algorithm
          </Link>
          <Link to="/deutsch" className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg bg-white'>
            Bernstein-Vazirani Algorithm
          </Link>
        </div>
      </div>
      
    </Layout>
  )
}

export default Algorithms