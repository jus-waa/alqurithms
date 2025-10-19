import { Chart as ChartJS } from "chart.js/auto"
import { Bar } from "react-chartjs-2"

export const options = {

}

export const data = {
  labels: ["0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000"],
  datasets: [{
    label: "Probability",
    data: [100],
  }],
}

const Probabilities = () => {
  return (
    <>
      <div className="border border-black/20 p-6 rounded-lg">
        <div>Probabilities</div>
        <Bar 
          options={options}
          data={data}
        />
      </div>
    </>
  )
}

export default Probabilities