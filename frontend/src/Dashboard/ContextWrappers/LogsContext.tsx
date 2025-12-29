import {
    createContext, useCallback,
    useContext,
    useEffect, useMemo,
    useState
} from "react";



export type LogMessage = {
    timestamp: string;
    bytes_sent: number;
    client_ip: string;
    endpoint: string;
    message: string;
    method: string;
    referrer: string;
    request_time: number;
    status_code: number;
    user_agent: string;
}



export type StatusInstance = Record<number, number>

export type IPInstance = Record<string, number>

export type EventInstance = {
    timestamp: number,
    count: number
}

type LogsContextType = {
    ips: IPInstance;
    logs: string[];
    addLog: (log: LogMessage) => void;
    logEvents: EventInstance[];
    timeline: number;
    statusCodes: StatusInstance;
    topIps: IPInstance;
}

type LogActionsContextType = {
    handleReset: () => void;
}

const LogsContext = createContext<LogsContextType|null>(null)

const LogActionsContext = createContext<LogActionsContextType|null>(null)


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


    const getTimeline = useCallback(()=> {
        setTimeline(prev => prev + 1)
    }, [])

    const getStatusCodes = useCallback((log:LogMessage) => {
        const code = log.status_code
        setStatusCodes(prev => ({
            ...prev,
            [code]: (prev[code] ?? 0) + 1
        }))
    }, [])

    const getTopIp = useCallback((log:LogMessage) => {
        const ip = log.client_ip

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
    }, [])

    const addLog = useCallback((log: LogMessage) => {
        setLogs(prev => [...prev, log.message])
        getStatusCodes(log)
        getTopIp(log)
        getTimeline()

    }, [getStatusCodes, getTopIp, getTimeline])

    const handleReset = useCallback(() => {
        setLogs([])
        setStatusCodes({
            200: 0,
            302: 0,
            401: 0,
            403: 0,
            404: 0,
            500: 0
        })
        setIps({})
        setTopIps({})
        setTimeline(0)
        setPrevTime(null)
        setLogEvents([])
    }, [])

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

    const contextValue = useMemo(() => ({
        ips,
        logs,
        statusCodes,
        timeline,
        logEvents,
        topIps,
        addLog,

    }), [statusCodes, timeline, logEvents, topIps, ips, logs, addLog])


    const logActionsValue = useMemo(() => ({
        handleReset
    }), [handleReset])

    return (
        <LogsContext.Provider value={contextValue}>
            <LogActionsContext.Provider value={logActionsValue}>
                {children}
            </LogActionsContext.Provider>
        </LogsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogsContext() {
  return useContext(LogsContext)!
}


// eslint-disable-next-line react-refresh/only-export-components
export function useLogActionsContext() {
    return useContext(LogActionsContext)!
}