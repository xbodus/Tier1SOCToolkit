import { createContext, useContext, useState } from "react";



export type StatusInstance = {
    status_code: string;
    timestamp: string;
}

type IPInstance = Record<string, number>

type LogsContextType = {
    logs: object[];
    statusCodes: StatusInstance[];
    ips: IPInstance;
    addLog: (log: object) => void;
}

const LogsContext = createContext<LogsContextType|null>(null)


export function LogsProvider({children}:{children: any}) {
    const [logs, setLogs] = useState<object[]>([])
    const [statusCodes, setStatusCodes] = useState<StatusInstance[]>([])
    const [ips, setIps] = useState<IPInstance>({})

    const addLog = (log: object) => {
        setLogs(prev => [...prev, log])
        getStatusCodes(log)
        getTopIp(log)
    }

    const getStatusCodes = (log:object) => {
        const time = log.event.created
        const code = log.http.response.status_code

        setStatusCodes(prev => [...prev, {status_code: code, timestamp: time}])
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

    return (
        <LogsContext.Provider value={{ logs, statusCodes, ips, addLog }}>
          {children}
        </LogsContext.Provider>
    )
}

export function useLogsContext() {
  return useContext(LogsContext)!
}