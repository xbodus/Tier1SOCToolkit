import {createContext, useContext, useEffect, useState} from "react";



export type StatusInstance = {
    200: number,
    302: number,
    401: number,
    403: number,
    404: number,
    500: number,
}

export type IPInstance = Record<string, number>

export type TimelineInstance = {
    timestamp: number,
    logged: boolean
}

export type EventInstance = {
    timestamp: number,
    count: number
}

type LogsContextType = {
    logs: object[];
    timeline: TimelineInstance[];
    statusCodes: StatusInstance;
    logEvents: EventInstance[]
    ips: IPInstance;
    addLog: (log: object) => void;
}

const LogsContext = createContext<LogsContextType|null>(null)


export function LogsProvider({children}:{children: any}) {
    const [logs, setLogs] = useState<object[]>([])
    const [statusCodes, setStatusCodes] = useState<StatusInstance>({
        200: 0,
        302: 0,
        401: 0,
        403: 0,
        404: 0,
        500: 0
    })
    const [ips, setIps] = useState<IPInstance>({})
    const [timeline, setTimeline] = useState<TimelineInstance[]>([])
    const [logEvents, setLogEvents] = useState<EventInstance[]>([])

    const addLog = (log: object) => {
        setLogs(prev => [...prev, log])
        getStatusCodes(log)
        getTopIp(log)
        getTimeline(log)
    }

    const getTimeline = (log:object)=> {
        const timestamp = new Date(log.event.created).getTime()
        const logged = false

        setTimeline(prev => [...prev, {timestamp: timestamp, logged: logged}])
    }

    const getStatusCodes = (log:object) => {
        const code = log.http.response.status_code

        setStatusCodes(prev => ({
            ...prev,
            [code]: (prev[code] ?? 0) + 1
        }))
    }

    const getTopIp = (log:object) => {
        const ip = log.source.ip
        setIps(prev => {
            const updated:IPInstance = {
                ...prev,
                [ip]: (prev[ip] ?? 0) + 1
            }
            const sorted_ips = Object.entries(updated).sort(([, a], [, b]) => b - a)
            const topFive = sorted_ips.slice(0, 5)

            return Object.fromEntries(topFive)
        })
    }

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeline(prevTimeline => {
                // Find unlogged events
                const unlogged = prevTimeline.filter(item => !item.logged);

                const updatedTimeline = prevTimeline.map(item =>
                     item.logged ? item : { ...item, logged: true }
                )

                // Add new bucket count
                setLogEvents(prev => [
                    ...prev,
                    {
                        timestamp: Date.now(),
                        count: unlogged.length
                    }
                ])

                return updatedTimeline
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <LogsContext.Provider value={{ logs, statusCodes, timeline, logEvents, ips, addLog }}>
          {children}
        </LogsContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLogsContext() {
  return useContext(LogsContext)!
}