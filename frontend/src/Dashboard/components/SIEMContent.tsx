import VisualsWrapper from "./VisualsWrapper.tsx";
import LineChartVolume from "./LineChart.tsx";
import PieChartVolume, {type PieDatum} from "./PieChart.tsx";
import StatusCodeBreakdown from "./StatusCodeBreakdown.tsx";
import SIEM from "./SIEM.tsx";
import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";


export default function SIEMContent() {
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
            <SIEM />
        </div>
    )
}