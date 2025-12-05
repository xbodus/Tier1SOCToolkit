import VisualsWrapper from "./VisualsWrapper.tsx";
import LineChartVolume from "./LineChart.tsx";
import PieChartVolume, {type PieDatum} from "./PieChart.tsx";
import StatusCodeBreakdown from "./StatusCodeBreakdown.tsx";
import SIEM from "./SIEM.tsx";
import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";
import DownloadLogs from "./DownloadLogs.tsx";
import StatusNotification from "./StatusNotification.tsx";


export default function SIEMContent({start}: {start:string|null}) {
    const {logEvents, ips, statusCodes} = useLogsContext()

    const pieData:PieDatum[] = Object.entries(ips).map(([ip, count]) => ({
        name: ip,
        value: count,
    }))

    return (
        <div className="siem-content">
            <VisualsWrapper>
                <LineChartVolume data={logEvents} />
                <PieChartVolume data={pieData} />
                <StatusCodeBreakdown data={statusCodes} />
            </VisualsWrapper>
            <h2 className="chart-title">Activity Logs:</h2>
            <div style={{ display: "flex", gap: 10, width: "100%", height: "45%" }}>
                <SIEM />
                <div className="side-controls">
                    <StatusNotification alert={false} />
                    <DownloadLogs start={start} />
                </div>
            </div>
        </div>
    )
}