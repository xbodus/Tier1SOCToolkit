import '@vitejs/plugin-react/preamble'

import React, {useState, Suspense } from "react"

import Simulations from "./components/SimControls.tsx"


export default function Dashboard() {
    const [content, setContent] = useState(1)
    const [simulation, setSimulation] = useState<int|null>(null)

    const SIEMContent = React.lazy(() => import("./components/SIEMContent"));
    const AnalyzerContent = React.lazy(() => import("./components/AnalyzerContent"));

    const VIEWS = {
        1: <SIEMContent />,
        2: <AnalyzerContent />
    }

    const handleSimulation = (number:int) => {
        setSimulation(number)
    }

    return (
        <>
            {!simulation &&  (<Simulations handleSim={handleSimulation} />)}
            {simulation && (
            <section id='react-dashboard' className='fullscreen'>
                <h1 className="siem-lab-label">Rouge Operations Operations Center</h1>
                <section className="siem-lab-content">
                    <Suspense fallback={<p>Loading…</p>}>
                        {VIEWS[content]}
                    </Suspense>
                </section>

                <section id="routing">
                    <div>
                        <button className="siem-lab-control" onClick={() => setContent(1)}>SIEM</button>
                        <button className="siem-lab-control" onClick={() => setContent(2)}>Analyze</button>
                    </div>
                    <a href="/" className="siem-lab-control"><button>Leave Lab</button></a>
                </section>
            </section>
            )}
        </>
    )
}
