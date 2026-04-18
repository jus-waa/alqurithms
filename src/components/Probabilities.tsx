import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import type { TooltipItem } from "chart.js"
import { Bar } from "react-chartjs-2"
import type { Qubit } from "../engine/qubit/Qubit"
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface ProbabilitiesProps {
  state: Qubit;
}

const Probabilities = ({ state }: ProbabilitiesProps) => {
  const dimension = state.length;
  const qubitCount = Math.log2(dimension);
  const entries = Array.from({ length: dimension }, (_, i) => ({
    label: `|${i.toString(2).padStart(qubitCount, "0")}⟩`,
    prob: Math.pow(Math.abs(state[i] as number), 2),
  })).sort((a, b) => a.label.localeCompare(b.label));

  const labels = entries.map(e => e.label);
  const data = {
    labels,
    datasets: [{
      label: 'Probability',
      data: entries.map(e => parseFloat((e.prob * 100).toFixed(2))),
      backgroundColor: 'rgba(0, 119, 182, 1)',
      borderRadius: 2,
    }],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<"bar">) => {
            const entry = entries[ctx.dataIndex];
            return `Prob: ${(entry.prob * 100).toFixed(2)}%`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: { color: 'rgba(0,0,0,0.06)' },
        ticks: {
          stepSize: 10,
          callback: (value: number | string) => `${value}%`,
        }
      },
      x: {
        grid: { display: false },
        ticks: {
          maxRotation: 90,
          minRotation: 45,
          font: {
            size: dimension > 16 ? 9 : 11,
            family: 'monospace',
          }
        }
      }
    }
  }

  return (
    <div className="">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3>Probabilities</h3>
      </div>
      <div className="flex-1">
        <Bar
          key={`${dimension}-histogram`}
          options={options}
          data={data}
        />
      </div>
    </div>
  )
}

export default Probabilities;