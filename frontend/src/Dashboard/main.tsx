import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../App.css"
import Dashboard from './Dashboard.tsx'
import {LogsProvider} from "./ContextWrappers/LogsContext.tsx"

createRoot(document.getElementById('dashboard')!).render(
  <StrictMode>
      <LogsProvider>
              <Dashboard />
      </LogsProvider>
  </StrictMode>,
)