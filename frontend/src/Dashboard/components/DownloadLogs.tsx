


export default function DownloadLogs() {
    const downloadLogs = () => {
        window.location.href = "/api/download-logs/";
    };

    return (
        <button
            onClick={downloadLogs}
            className="sim-control"
            style={{ height: "15%", width: "100%" }}
        >
            Download Logs
        </button>
    );
}