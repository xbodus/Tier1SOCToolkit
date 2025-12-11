import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";



export type StatusInstance = Record<number, number>

export type IPInstance = Record<string, number>

export type EventInstance = {
    timestamp: number,
    count: number
}

type LogsContextType = {
    logs: string[];
    timeline: number[];
    statusCodes: StatusInstance;
    logEvents: EventInstance[]
    topIps: IPInstance;
    alert: {detected: boolean, type: string|null};
    flaggedLogs: object[];
    addLog: (log: object, alert: { detected: boolean; alert_type: string | null; details: object }) => void;
}

const LogsContext = createContext<LogsContextType|null>(null)


export function LogsProvider({children}:{children: any}) {
    const [logs, setLogs] = useState<string[]>([])
    const [statusCodes, setStatusCodes] = useState<StatusInstance>({
        200: 0,
        302: 0,
        401: 0,
        403: 0,
        404: 0,
        500: 0
    })
    const [ips, setIps] = useState<IPInstance>({})
    const [topIps, setTopIps] = useState<IPInstance>({})
    const [timeline, setTimeline] = useState<number>(0)
    const [prevTime, setPrevTime] = useState<number|null>(null)
    const [logEvents, setLogEvents] = useState<EventInstance[]>([])
    const [alert, setAlert] = useState<{detected: boolean, type: string|null}>({detected: false, type: null})
    const [flaggedLogs, setFlaggedLogs] = useState<object[]>([])

    const addLog = (log: object, monitor_alert: {detected: boolean, alert_type: string|null, details: object}) => {
        setLogs(prev => [...prev, log.event.original])
        getStatusCodes(log)
        getTopIp(log)
        getTimeline()

        if (monitor_alert.detected) {
            setAlert({detected: monitor_alert.detected, type: monitor_alert.alert_type || null})
            setFlaggedLogs(prev => [...prev, monitor_alert.details])
        }
    }

    const getTimeline = ()=> {
        setTimeline(prev => prev + 1)

    }

    const getStatusCodes = (log:{ http: { response: {status_code: number} } }) => {
        const code = log.http.response.status_code

        setStatusCodes(prev => ({
            ...prev,
            [code]: (prev[code] ?? 0) + 1
        }))
    }

    const getTopIp = (log:{ source: { ip: string } }) => {
        const ip = log.source.ip

        setIps(prevIps => {
            const updatedIps = {
              ...prevIps,
              [ip]: (prevIps[ip] ?? 0) + 1
            }

            const sorted = Object.entries(updatedIps)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)

            setTopIps(Object.fromEntries(sorted))

            return updatedIps
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeline(prevTimeline => {
                const baseTime = prevTime ?? new Date().getTime()

                setLogEvents((prev) => {
                    const updated = [
                        ...prev,
                        {
                            timestamp: baseTime,
                            count: prevTimeline
                        }
                    ]

                    const timeFilter = baseTime - 6 * 60 * 1000
                    return updated.filter(x => x["timestamp"] > timeFilter)
                })

                setPrevTime(baseTime)

                return 0
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [])


    return (
        <LogsContext.Provider value={{ logs, statusCodes, timeline, logEvents, topIps, alert, flaggedLogs, addLog }}>
          {children}
        </LogsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogsContext() {
  return useContext(LogsContext)!
}