import { Chart as ChartJS } from "chart.js/auto"
import { Bar } from "react-chartjs-2"
import type { Qubit } from "../engine/Qubit";

const options = {
  responsive: true,
  maintainAspectRatio: true,
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: function(value: number) {
          return value + '%'
        }
      }
    }
  }
}

const Probabilities = ({state} : {state: Qubit}) => {
  const prob = state.map((amp: number) => Math.pow(Math.abs(amp), 2) * 100);
  const data = {
    labels: ["0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"],
    datasets: [{
      label: "Probability (%)",
      data: prob,
      backgroundColor: Array(16)
        .fill(0)
        .map((_, i) => `hsla(${i * 22.5}, 80%, 60%, 0.8)`),
    }],
  }

  return (
    <>
      <div className="border border-black/20 p-6 rounded-lg">
        <h3>Probabilities</h3>
        <Bar 
          options={options}
          data={data}
        />
      </div>
    </>
  )
}

export default Probabilities