



export default function Simulations({handleSim}:{handleSim:(arg0: number) => void}) {
    const simulations = ["Simulation 1", "Simulation 2", "Simulation 3"]

    return (
        <div className="sim-controls">
            <h2 className="sim-title">Choose your experience</h2>
            <div className="flex gap-10 center">
                {simulations.map((sim, i) => (
                    <button key={i} className="sim-control" onClick={() => handleSim(i)}>{sim}</button>
                ))}
            </div>
        </div>
    )
}