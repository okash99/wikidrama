import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Duel from './pages/Duel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/duel" element={<Duel />} />
      </Routes>
    </BrowserRouter>
  )
}
