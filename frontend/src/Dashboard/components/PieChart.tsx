import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";


export default function PieChart() {
    const {ips} = useLogsContext()



    return (
        <div>
            {Object.entries(ips).length === 0 && <p className="white">Waiting for data</p>}
            {Object.entries(ips).length > 0 && (
                <>
                    {Object.entries(ips).map(([ip, count]) => (
                        <p key={ip} className="white">{ip}: {count}</p>
                    ))}
                </>
            )}
        </div>
    )
}