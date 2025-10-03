import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Layout from '../components/Layout'
import Circuit from '../components/Circuit'
import Gate from '../components/gates/Gate'
const DeutschJozsa = () => {
  return (
    <Layout>
      <DndProvider backend={HTML5Backend}>
        <div className="flex gap-6">
          <div className="border border-black/20 p-6 rounded-lg h-90 w-90">
            <div className="text-center border border-black/20 p-6 rounded-lg mb-6">Gates</div>
            <Gate name="H" />
            <Gate name="X" />
          </div>
          <div>
            <Circuit/>
          </div>
        </div>
      </DndProvider>
    </Layout>
  )
}

export default DeutschJozsa