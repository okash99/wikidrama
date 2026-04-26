import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { clearStaleCache } from './utils/cache'

// Purge les anciennes versions de cache au démarrage (v1–v7)
clearStaleCache()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
