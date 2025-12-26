import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer} from "recharts"
import {type EventInstance} from "../ContextWrappers/LogsContext.tsx"




export default function LineChartVolume({data}:{data: EventInstance[]}) {
    const now = Date.now();
    const WINDOW = 5 * 60 * 1000;

    const visible = data.filter(d => now - d.timestamp <= WINDOW)

    return (
        <div className="graph-container">
            <h2 className="chart-title">Activity:</h2>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart width={800} height={300} data={visible} responsive>
                    <CartesianGrid strokeDasharray="3 3" stroke="#39ff14" />
                    <XAxis
                        dataKey="timestamp"
                        tick={{ fill: "#39ff14", fontSize: 12 }}
                        axisLine={{ stroke: "#39ff14" }}
                        tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                        domain={['dataMin', 'dataMax']}
                    />

                    <YAxis
                        dataKey="count"
                        tick={{ fill: "#39ff14", fontSize: 12 }}
                        axisLine={{ stroke: "#39ff14" }}
                        width="auto"
                    />
                    <Tooltip
                        labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                    />

                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#39ff14"
                        strokeWidth={2}
                        isAnimationActive={false}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}