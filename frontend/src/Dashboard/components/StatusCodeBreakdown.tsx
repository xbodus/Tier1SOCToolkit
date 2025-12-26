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
    return (
        <div className="graph-container">
            <h2 className="chart-title">Status Codes:</h2>
            <ResponsiveContainer width={"100%"} height={"100%"}>
                <RadarChart outerRadius={130} width={400} height={300} data={radarData}>
                    <PolarGrid stroke="#39ff14" />
                    <PolarAngleAxis dataKey="code" tick={{ fill: "#39ff14", fontSize: 12 }} />
                    <Radar name="Status Codes" dataKey="count" stroke="#39ff14" fill="#39ff14" fillOpacity={0.5} isAnimationActive={false} />
                    <Tooltip formatter={(value: number) => value.toString()} />
                </RadarChart>
            </ResponsiveContainer>
        </div>

    )
}