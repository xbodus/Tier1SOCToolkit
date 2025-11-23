import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";
import {useState, useEffect} from "react";



export default function StatusCodeBreakdown() {
    const {statusCodes} = useLogsContext()
    const [codes, setCodes] = useState<Record<string, number>>({})

    useEffect(() => {
        const handleCodes = (code: string) => {
            setCodes(prev => ({
                ...prev,
                [code]: (prev[code] ?? 0) + 1
            }))
        }

        for (let i = 0; i < statusCodes.length; i++) {
            const sc = statusCodes[i].status_code
            handleCodes(sc)
        }
    }, [statusCodes])

    return (
        <div>
            {Object.keys(codes).length === 0 && (<p className="white">Waiting for data</p>)}
            {codes && (
                <>
                    {Object.entries(codes).map(([code, count]) => (
                        <p key={code} className="white">
                            {code}: {count}
                        </p>
                    ))}
                </>
            )}
        </div>
    )
}