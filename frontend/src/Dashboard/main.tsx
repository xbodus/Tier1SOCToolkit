import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../App.css"
import Dashboard from './Dashboard.tsx'

createRoot(document.getElementById('dashboard')!).render(
  <StrictMode>
    <Dashboard />
  </StrictMode>,
)