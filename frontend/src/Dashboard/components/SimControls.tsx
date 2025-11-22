



export default function Simulations({handleSim}:{handleSim:(number) => void}) {
    const simulations = ["Simulation 1", "Simulation 2", "Simulation 3"]

    return (
        <>
            {simulations.map((sim, i) => (
                <button key={i} onClick={(i) => handleSim(i)}>{sim}</button>
            ))}
        </>
    )
}