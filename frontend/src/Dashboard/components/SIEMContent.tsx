import VisualsWrapper from "./VisualsWrapper.tsx";
import LineChart from "./LineChart.tsx";
import PieChart from "./PieChart.tsx";
import StatusCodeBreakdown from "./StatusCodeBreakdown.tsx";
import SIEM from "./SIEM.tsx";


export default function SIEMContent() {
    return (
        <div className="siem-content">
            <VisualsWrapper>
                <LineChart />
                <PieChart />
                <StatusCodeBreakdown />
            </VisualsWrapper>
            <SIEM />
        </div>
    )
}