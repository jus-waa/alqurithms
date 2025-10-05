import Gate from './Gate'

const HadamardGate = () => {
  return (
    <Gate
      name = 'H'
      description='Hadamard Gate: creates superposition of |0⟩ and |1⟩'
      type='Hadamard Gate'
    />
  )
}     

export default HadamardGate