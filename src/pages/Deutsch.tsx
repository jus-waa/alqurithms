import Layout from '../components/Layout'
import Circuit from '../components/Circuit'
const Deutsch = () => {
  return (
    <Layout>
      <div className='grid grid-cols-[1fr_2fr_2fr] gap-6 h-80'>
        <Circuit/>
      </div>
    </Layout>
  )
}

export default Deutsch