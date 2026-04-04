import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"
import type { Qubit } from "../engine/qubit/Qubit"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const Probabilities = ({ state } : { state: Qubit }) => {
  const dimension = state.length;
  const qubitCount = Math.log2(dimension);
  const prob = state.map((amp: number) => Math.pow(Math.abs(amp), 2) * 100);  
  const labels = Array.from({ length:  dimension }, (_, i) => i.toString(2).padStart(qubitCount, "0"));
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: string | number) {
            return value + '%'
          }
        }
      },
      x: {
        ticks: {
          maxRotation: 90,
          minRotation: 45,
          font: {
            size: dimension > 16 ? 9 : 11,
          }
        }
      }
    }
  }

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
          key={dimension}
          options={options}
          data={data}
        />
      </div>
    </>
  )
}

export default Probabilities