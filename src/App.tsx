import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Home from './pages/Home'
import Duel from './pages/Duel'
import WikiWars from './pages/WikiWars'
import NotFound from './pages/NotFound'
import { ProfileProvider } from './context/ProfileContext'

export default function App() {
  return (
    <ErrorBoundary>
      <ProfileProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/duel" element={<Duel />} />
            <Route path="/wikiwars" element={<WikiWars />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ProfileProvider>
    </ErrorBoundary>
  )
}
