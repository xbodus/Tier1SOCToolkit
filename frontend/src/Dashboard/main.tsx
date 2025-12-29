import { createRoot } from 'react-dom/client'
import "../App.css"
import Dashboard from './Dashboard.tsx'
import {LogsProvider} from "./ContextWrappers/LogsContext.tsx"
import {AnalyzerProvider} from "./ContextWrappers/AnalyzerContext.tsx";
import {ReportProvider} from "./ContextWrappers/ReportContext.tsx";
import ErrorBoundary from "./ErrorBoundaries/ErrorBoundary.tsx";
import ProviderErrorFallback from "./ErrorBoundaries/ErrorFallback.tsx";
import {AlertProvider} from "./ContextWrappers/AlertContext.tsx";


createRoot(document.getElementById('dashboard')!).render(
    <ErrorBoundary
        fallback={<ProviderErrorFallback />}
    >
        <LogsProvider>
            <AlertProvider>
                <AnalyzerProvider>
                    <ReportProvider>
                        <Dashboard />
                    </ReportProvider>
                </AnalyzerProvider>
            </AlertProvider>
        </LogsProvider>
    </ErrorBoundary>,
)