import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'


import Home from './pages/Home.tsx'
import Algorithms from './pages/Algorithms.tsx'
import DeutschJozsa from './pages/DeutschJozsa.tsx'
const App = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="home" replace/>}/>
          <Route path="/home" element={<Home />} />
          <Route path="/algorithms" element={<Algorithms/>} />
          <Route path="/deutschjozsa" element={<DeutschJozsa/>} />
      </Routes>
    </Router>
  )
}

export default App