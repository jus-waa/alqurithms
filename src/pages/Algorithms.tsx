import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Algorithms = () => {
  return (
    <Layout>
        <div className='flex flex-col w-full gap-6 '>
            <div className='grid grid-cols-3 h-full p-40 gap-6 border border-black/20 rounded-lg bg-white'>
              <Link to="/deutsch" className='flex justify-center items-end text-center h-64 pb-8 border border-black/20 rounded-lg bg-white'>
                Deutsch Algorithm
              </Link>
              <Link to="/deutsch" className='flex justify-center items-end text-center h-64 pb-8 border border-black/20 rounded-lg bg-white'>
                  Deutsch Algorithm
              </Link>
              <Link to="/deutsch" className='flex justify-center items-end text-center h-64 pb-8 border border-black/20 rounded-lg bg-white'>
                  Deutsch Algorithm
              </Link>
              <Link to="/deutsch" className='flex justify-center items-end text-center h-64 pb-8 border border-black/20 rounded-lg bg-white'>
                Deutsch Algorithm
              </Link>
              <Link to="/deutsch" className='flex justify-center items-end text-center h-64 pb-8 border border-black/20 rounded-lg bg-white'>
                  Deutsch Algorithm
              </Link>
              <Link to="/deutsch" className='flex justify-center items-end text-center h-64 pb-8 border border-black/20 rounded-lg bg-white'>
                  Deutsch Algorithm
              </Link>
            </div>
        </div>
    </Layout>
  )
}

export default Algorithms