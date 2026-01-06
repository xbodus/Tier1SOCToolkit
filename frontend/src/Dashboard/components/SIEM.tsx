import {useState, useEffect, useRef} from "react";
import {
    type LogMessage,
    useLogsContext
} from "../ContextWrappers/LogsContext.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";


type AlertMessage = {
    detected: boolean;
    alert_type: string|null;
    details: object
}


export default function SIEM() {
    const {logs, addLog} = useLogsContext()
    const {logAlert,setAlert} = useAlertContext()
    const [sessionKey, setSessionKey] = useState<string | null>(null)
    const [ws, setWs] = useState<string|null>(null)
    const socket = useRef<WebSocket | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [cooldown, setCooldown] = useState(0)

    useEffect(() => {
        if (cooldown > 0) return

        const fetchSession = async () => {
            try {
                const response = await fetch("/api/start-logs")
                const data = await response.json()

                if (data.cooldown) {
                    setCooldown(data.cooldown_remaining)
                    return
                }
                setSessionKey(data.session_key)
                setWs(data.ws_url)
            } catch (err) {
                console.error("Failed to get session key:", err)
            }
        }

        fetchSession()
    }, [cooldown])


    useEffect(() => {
        if (!sessionKey) return

        socket.current = ws ? new WebSocket(ws) : new WebSocket(`ws://127.0.0.1:8000/ws/logs/${sessionKey}/`)

        socket.current.onopen = () => {
            console.log("WebSocket connected")
        }

        socket.current.onmessage = (event) => {
            const data:{message: LogMessage, alert: AlertMessage} = JSON.parse(event.data)
            const message:LogMessage = data.message
            const alert:AlertMessage = data.alert
            addLog(message)

            if (alert.detected && !logAlert.type) {
                setAlert(prev => {
                    if (prev.type) return prev
                    return {detected: alert.detected, type:alert.alert_type || null}
                })
            }
        }

        socket.current.onclose = () => {
            console.log("WebSocket closed")
        }

        socket.current.onerror = (err) => {
            console.error("WebSocket error:", err)
        }

        return () => socket.current?.close()
    }, [sessionKey, ws])

    useEffect(() => {
        if (logs.length === 0) {
            setIsLoading(true)
        } else {
            setIsLoading(false)
        }
    }, [logs])

    useEffect(() => {
        if (cooldown <= 0) return

        const interval = setInterval(() => {
            setCooldown(prev => Math.max(prev - 1, 0));
        }, 1000)

        return () => clearInterval(interval)
    }, [cooldown])


    const CooldownTimer = () => {
        return (
            <div>
                <p className="white">System starting up…</p>
                <p className="white">Please wait {cooldown} seconds.</p>
            </div>
        )
    }


    const Logs = () => {
        const reversedLogs = [...logs].reverse()

        return (
            <div>
                {reversedLogs.map((log, index) => (
                    <div key={index}>
                        <p className="white">{log}</p>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="log-window overflow-y">
            {cooldown > 0 && (<CooldownTimer />)}
            {isLoading && cooldown <= 0 && (<p className="white">Waiting for logs...</p>)}
            {!isLoading && cooldown <=0 && logs && (<Logs />)}
        </div>
    )
}