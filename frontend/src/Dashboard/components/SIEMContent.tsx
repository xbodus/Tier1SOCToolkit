import VisualsWrapper from "./VisualsWrapper.tsx";
import LineChartVolume from "./LineChart.tsx";
import PieChart from "./PieChart.tsx";
import StatusCodeBreakdown from "./StatusCodeBreakdown.tsx";
import SIEM from "./SIEM.tsx";
import {useLogsContext} from "../ContextWrappers/LogsContext.tsx";


export default function SIEMContent() {
    const {logEvents} = useLogsContext()

    return (
        <div className="siem-content">
            <VisualsWrapper>
                <LineChartVolume data={logEvents} />
                <PieChart />
                <StatusCodeBreakdown />
            </VisualsWrapper>
            <SIEM />
        </div>
    )
}