import {type StatusInstance} from "../ContextWrappers/LogsContext.tsx";
import {PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip} from "recharts";


export interface RadarDatum {
  code: string;
  count: number;
}

export default function StatusCodeBreakdown({data}:{data:StatusInstance}) {
    const radarData: RadarDatum[] = Object.entries(data).map(
        ([code, count]) => ({
            code,
            count
        })
    )

    const CustomTooltip = ({ active, payload, label }: {active?: boolean, payload?:any, label?:number}) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: "#1a1a1a", color: "#39ff14", padding: ".25rem 1rem", border: "2px solid #39ff14", textAlign: "center"}}> {/* Your custom wrapper class */}
                    {`Status Code: ${label}`}<br/>{`Value: ${payload[0].value}`}
                </div>
            );
        }
        return null;
    }

    return (
        <div className="graph-container">
            <h2 className="chart-title">Status Codes:</h2>
            <ResponsiveContainer width={"100%"} height={"100%"}>
                <RadarChart  width={400} height={300} data={radarData}>
                    <PolarGrid stroke="#39ff14" />
                    <PolarAngleAxis dataKey="code" tick={{ fill: "#39ff14", fontSize: 12 }} />
                    <Radar name="Status Codes" dataKey="count" stroke="#39ff14" fill="#39ff14" fillOpacity={0.5} isAnimationActive={false} />
                    <Tooltip content={<CustomTooltip />} />
                </RadarChart>
            </ResponsiveContainer>
        </div>

    )
}