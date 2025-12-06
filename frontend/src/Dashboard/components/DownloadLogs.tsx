import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";


export default function DownloadLogs({start}: {start: string|null}) {
    const {alert} = useLogsContext()

    const downloadLogs = () => {
        if (!start) {
            console.log("No simulation start time found.")
            return
        }
        const current = new Date().toISOString()

        console.log(alert.type)

        window.location.href =  `/api/download-logs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(current)}`
    }

    return (
        <button
            onClick={() => downloadLogs()}
            className="sim-control"
            style={{ height: "15%", width: "100%" }}
        >
            Download Logs
        </button>
    );
}