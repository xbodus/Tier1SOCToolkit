import { createContext, useContext, useState } from "react";



export type LogInstance = {
    log: object;
}

type LogsContextType = {
    logs: LogInstance[];
    addLog: (log: object) => void;
}

const LogsContext = createContext<LogsContextType|null>(null)


export function LogsProvider({children}:{children: any}) {
    const [logs, setLogs] = useState<LogInstance[]>([])

    const addLog = (log: object) => {
        setLogs(prev => [...prev, log])
    }

    return (
        <LogsContext.Provider value={{ logs, addLog }}>
          {children}
        </LogsContext.Provider>
    )
}

export function useLogsContext() {
  return useContext(LogsContext)!
}