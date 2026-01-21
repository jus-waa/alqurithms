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

const Probabilities = ({ state } : { state: Qubit }) => {
  const dimension = state.length;
  const qubitCount = Math.log2(dimension);
  const prob = state.map((amp: number) => Math.pow(Math.abs(amp), 2) * 100);  
  const labels = Array.from({ length:  dimension }, (_, i) => i.toString(2).padStart(qubitCount, "0"));

  const data = {
    labels,
    datasets: [{
      label: "Probability (%)",
      data: prob,
      backgroundColor: Array.from({ length: dimension }, (_, i) =>
        `hsla(${(i * 360) / dimension}, 80%, 60%, 0.8)`
      ),
    }],
  }

  return (
    <>
      <div className="border border-black/20 p-6 rounded-lg bg-white h-full">
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