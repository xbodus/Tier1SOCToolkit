import VisualsWrapper from "./VisualsWrapper.tsx";
import LineChartVolume from "./LineChart.tsx";
import PieChartVolume, {type PieDatum} from "./PieChart.tsx";
import StatusCodeBreakdown from "./StatusCodeBreakdown.tsx";
import SIEM from "./SIEM.tsx";
import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";
import DownloadLogs from "./DownloadLogs.tsx";
import StatusNotification from "./StatusNotification.tsx";
import {useAlertContext} from "../ContextWrappers/AlertContext.tsx";


export default function SIEMContent({start}: {start:string|null}) {
    const {logEvents, topIps, statusCodes} = useLogsContext()
    const {logAlert} = useAlertContext()

    const pieData:PieDatum[] = Object.entries(topIps).map(([ip, count]) => ({
        name: ip,
        value: count,
    }))

    return (
        <div className="siem-content">
            <VisualsWrapper>
                <LineChartVolume data={logEvents} />
                <div className={"visuals-sub-wrapper"}>
                    <PieChartVolume data={pieData} />
                    <StatusCodeBreakdown data={statusCodes} />
                </div>
            </VisualsWrapper>
            <h2 className="chart-title">Activity Logs:</h2>
            <VisualsWrapper>
                <SIEM />
                <div className="side-controls">
                    <StatusNotification alert={logAlert.detected} />
                    <DownloadLogs start={start} />
                </div>
            </VisualsWrapper>
        </div>
    )
}