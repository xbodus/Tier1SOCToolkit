import '@vitejs/plugin-react/preamble'

import React, {useState, Suspense, type ReactNode} from "react"

import Simulations from "./components/SimControls.tsx"



export default function Dashboard() {
    const [content, setContent] = useState<number>(1)
    const [simulation, setSimulation] = useState<number|null>(null)
    const [startTime, setStartTime] = useState<string|null>(null)

    const SIEMContent = React.lazy(() => import("./components/SIEMContent"));
    const AnalyzerContent = React.lazy(() => import("./components/AnalyzerContent"));

    const VIEWS: { [key: number]: ReactNode } = {
        1: <SIEMContent start={startTime} />,
        2: <AnalyzerContent />
    }

    const handleSimulation = (number:number) => {
        const simulationMapping: Record<number, string> = {
            1: "/api/start-simulation-1",
            2: "/api/start-simulation-2"
        }
        fetch(simulationMapping[number])
            .then(r => console.log(r))
        setStartTime(new Date().toISOString())
        setSimulation(number)
    }

    return (
        <>
            {!simulation &&  (<Simulations handleSim={handleSimulation} />)}
            {simulation && (
            <section id='react-dashboard' className='fullscreen'>
                <h1 className="siem-lab-label">Rouge Operations Security Center</h1>
                <section className="siem-lab-content">
                    <Suspense fallback={<p>Loading…</p>}>
                        {VIEWS[content]}
                    </Suspense>
                </section>

                <section id="routing">
                    <div>
                        <button className={`siem-lab-control ${content === 1 ? "active" : ""}`} onClick={() => setContent(1)}>SIEM</button>
                        <button className={`siem-lab-control ${content === 2 ? "active" : ""}`} onClick={() => setContent(2)}>Analyze</button>
                    </div>
                    <a href="/"><button className="siem-lab-exit">Leave Lab</button></a>
                </section>
            </section>
            )}
            <div id="crt-overlay"></div>
        </>
    )
}
