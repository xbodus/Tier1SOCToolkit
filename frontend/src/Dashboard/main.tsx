import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../App.css"
import Dashboard from './Dashboard.tsx'
import {WindowProvider} from "./ContextWrappers/WindowContext.tsx";

createRoot(document.getElementById('dashboard')!).render(
  <StrictMode>
      <WindowProvider>
              <Dashboard />
      </WindowProvider>
  </StrictMode>,
)