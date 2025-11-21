import {useState, useEffect, useRef} from "react";


export default function SIEM() {
    const [sessionKey, setSessionKey] = useState<string | null>(null)
    const socket = useRef<WebSocket | null>(null)
    const [logs, setLogs] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("/api/start-logs")
                const data = await response.json()
                setSessionKey(data.session_key)
            } catch (err) {
                console.error("Failed to get session key:", err)
            }
        }

        fetchSession()
    }, [])


    useEffect(() => {
        if (!sessionKey) return

        socket.current = new WebSocket(`ws://127.0.0.1:8000/ws/logs/${sessionKey}/`)

        socket.current.onopen = () => {
            console.log("WebSocket connected")
        }

        socket.current.onmessage = (event) => {
            const data = JSON.parse(event.data)
            console.log(data)
            setLogs((prevLogs) => [...prevLogs, data])
        }

        socket.current.onclose = () => {
            console.log("WebSocket closed")
        }

        socket.current.onerror = (err) => {
            console.error("WebSocket error:", err)
        }

        return () => socket.current?.close()
    }, [sessionKey])

    useEffect(() => {
        if (logs.length === 0) {
            setIsLoading(true)
        } else {
            setIsLoading(false)
        }
    }, [logs])

    const Logs = () => {
        return (
            <div>
                {logs.map((log, index) => (
                    <div key={index}>
                        <p>{JSON.stringify(log.event)}</p>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div>
            <h2>SIEM</h2>
            <div className="log-window overflow-y">
                {isLoading && (<p>Waiting for logs...</p>)}
                {!isLoading && logs && (<Logs />)}
            </div>
        </div>
    )
}