



export default function Simulations({handleSim}:{handleSim:(arg0: number) => void}) {
    const simulations = ["Simulation 1", "Simulation 2", "Simulation 3"]

    return (
        <div className="h-full flex flex-column justify-center gap-30">
            <h2 className="sim-title">Choose your experience</h2>
            <div className="flex gap-10 justify-center">
                {simulations.map((sim, i) => (
                    <button key={i} className="sim-control" onClick={() => handleSim(i+1)}>{sim}</button>
                ))}
            </div>
        </div>
    )
}