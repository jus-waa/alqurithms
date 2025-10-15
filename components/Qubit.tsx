import type { Qubit } from '../engine/Qubit'

type QubitProps = {
  state: Qubit;
};

const Qubit = ( { state }: QubitProps) => {
  const [a, b] = state;
  return (
    <div className="p-2 border border-black/20 rounded-lg">
      |ψ⟩ = {a.toFixed(2)}|0⟩ + {b.toFixed(2)}|1⟩
    </div>
  )
}

export default Qubit