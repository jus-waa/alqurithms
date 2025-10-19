import Layout from '../components/Layout'
import Circuit from '../components/Circuit'
import Probabilities from '../components/Probabilities'

const DeutschJozsa = () => {
  return (
    <Layout>
      <div className='grid grid-cols-[1fr_2fr_2fr] gap-6 h-80'>
        <Circuit/>
        <Probabilities/>
      </div>
    </Layout>
  )
}

export default DeutschJozsa