import '@vitejs/plugin-react/preamble'

import React, {useState, Suspense, type ReactNode} from "react"

import Simulations from "./components/SimControls.tsx"
import {useLogActionsContext} from "./ContextWrappers/LogsContext.tsx";
import {useAlertContext} from "./ContextWrappers/AlertContext.tsx";




const SIEMNav = React.memo(({setContent, content}:{setContent: React.Dispatch<React.SetStateAction<number>>, content:number}) => {
    const {logAlert} = useAlertContext()

    const handleDashboard = (num:number) => {
        if (!logAlert.type) {
            alert("No alerts triggered. Keep monitoring for abnormal traffic")
            return
        }

        setContent(num)
    }

    return(
        <>
            <button className={`siem-lab-control ${content === 1 ? "active" : ""}`} onClick={() => setContent(1)}>SIEM</button>
            <button className={`siem-lab-control ${content === 2 ? "active" : ""}`} onClick={() => handleDashboard(2)}>Analyze</button>
            <button className={`siem-lab-control ${content === 4 ? "active" : ""}`} onClick={() => handleDashboard(4)}>Begin Report</button>
        </>
    )
})


const ResetDashboard = () => {
    const {resetAlert} = useAlertContext()
    const {handleReset} = useLogActionsContext()

    const resetDashboard = () => {
        handleReset()
        resetAlert()
    }

    return (
        <>
            <a href={"/lab"}><button className="siem-lab-exit" onClick={() => resetDashboard()}>Select Simulation</button></a>
        </>
    )
}


export default function Dashboard() {
    const [content, setContent] = useState<number>(1)
    const [simulation, setSimulation] = useState<number|null>(null)
    const [startTime, setStartTime] = useState<string|null>(null)

    const SIEMContent = React.lazy(() => import("./components/SIEMContent"));
    const AnalyzerContent = React.lazy(() => import("./components/AnalyzerContent"));
    const ReportContent = React.lazy(() => import("./components/SimReport"));

    const handleSimulation = (number:number) => {
        const simulationMapping: Record<number, string> = {
            1: "/api/start-simulation-1",
            2: "/api/start-simulation-2",
            3: "/api/start-simulation-3"
        }
        fetch(simulationMapping[number])
            .then(r => console.log(r))
        setStartTime(new Date().toISOString())
        setSimulation(number)
    }

    const VIEWS: { [key: number]: ReactNode } = {
        1: <SIEMContent start={startTime} />,
        2: <AnalyzerContent />,
        4: <ReportContent />
    }

    return (
        <>
            {!simulation &&  (
                <section id='react-dashboard' style={{ height: "100%", width: "100%"}}>
                    <h1 className="siem-lab-label">Rouge Operations Security Center</h1>
                    <section className="siem-lab-content">
                        <Simulations handleSim={handleSimulation} />
                    </section>
                    <section id="routing">
                        <div className={"flex flex-column"}>
                            <SIEMNav content={content} setContent={setContent} />
                        </div>
                        <a href="/"><button className="siem-lab-exit">Leave Lab</button></a>
                    </section>
                </section>
            )}
            {simulation && (
                <section id='react-dashboard' style={{ height: "100%", width: "100%"}}>
                    <h1 className="siem-lab-label">Rouge Operations Security Center</h1>
                    <section className="siem-lab-content">
                        <Suspense fallback={<p style={{ color: "#39ff14" }}>Loading…</p>}>
                            {VIEWS[content]}
                        </Suspense>
                    </section>

                    <section id="routing">
                        <div className={"flex flex-column"}>
                            <SIEMNav content={content} setContent={setContent} />
                        </div>
                        <ResetDashboard />
                        <a href="/"><button className="siem-lab-exit">Leave Lab</button></a>
                    </section>
                </section>
            )}
            <div id="crt-overlay"></div>
        </>
    )
}
