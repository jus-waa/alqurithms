import { Link } from 'react-router-dom'
import Layout from '../components/Layout'

const Algorithms = () => {
  return (
    <Layout>
        <div className='flex flex-col w-full gap-6'>
            <div className='grid grid-cols-3 grid-rows-[auto_1fr_1fr] h-full p-32 gap-6 border border-black/20 rounded-lg'>
                <span className='col-start-2 text-center mb-6'>Choose your first quantum step.</span>
                <Link to="/deutschjozsa" className='flex justify-center items-end text-center pb-8 col-start-1 border border-black/20 rounded-lg'>
                  <div>
                    Deutsch-Jozsa Algorithm
                  </div>
                </Link>
                <div className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg'>
                s
                </div>
                <div className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg'>
                s
                </div>
                <div className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg'>
                s
                </div>
                <div className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg'>
                s
                </div>
                <div className='flex justify-center items-end text-center pb-8 border border-black/20 rounded-lg'>
                s
                </div>
                
            </div>
        </div>
    </Layout>
  )
}

export default Algorithms