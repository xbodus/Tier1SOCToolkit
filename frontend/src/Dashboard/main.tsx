import { createRoot } from 'react-dom/client'
import "../App.css"
import Dashboard from './Dashboard.tsx'
import {LogsProvider} from "./ContextWrappers/LogsContext.tsx"

createRoot(document.getElementById('dashboard')!).render(
      <LogsProvider>
              <Dashboard />
      </LogsProvider>,
)