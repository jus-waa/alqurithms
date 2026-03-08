import { BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom'


import Home from './pages/Home.tsx'
import Algorithms from './pages/Algorithms.tsx'
import Deutsch from './pages/Deutsch.tsx'
import DeutschJozsa from './pages/DeutschJozsa.tsx'
import BernsteinVazirani from './pages/BernsteinVazirani.tsx'

const App = () => {
  return (
    <Router>
      <Routes>
          <Route path="/" element={<Navigate to="home" replace/>}/>
          <Route path="/home" element={<Home />} />
          <Route path="/algorithms" element={<Algorithms/>} />
          <Route path="/deutsch" element={<Deutsch/>} />
          <Route path="/deutschJozsa" element={<DeutschJozsa/>} />
          <Route path="/bernsteinVazirani" element={<BernsteinVazirani/>} />
      </Routes>
    </Router>
  )
}

export default App