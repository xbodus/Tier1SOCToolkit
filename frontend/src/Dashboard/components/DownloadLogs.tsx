import {useAnalyzerContext} from "../ContextWrappers/AnalyzerContext.tsx";


export default function DownloadLogs({start}: {start: string|null}) {
    const {setLogDownloaded} = useAnalyzerContext()

    const downloadLogs = () => {
        if (!start) {
            console.log("No simulation start time found.")
            return
        }
        const current = new Date().toISOString()

        window.location.href =  `/api/download-logs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(current)}`

        return setLogDownloaded(true)
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