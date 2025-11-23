import {LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid} from "recharts"
import {type EventInstance} from "../ContextWrappers/LogsContext.tsx"




export default function LineChartVolume({data}:{data: EventInstance[]}) {
    const now = Date.now();
    const WINDOW = 5 * 60 * 1000;

    const visible = data.filter(d => now - d.timestamp <= WINDOW)

    return (
        <>
            <LineChart width={800} height={300} data={visible} responsive>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                    dataKey="timestamp"
                    tick={{ fill: "#39ff14", fontSize: 12 }}
                    axisLine={{ stroke: "#39ff14" }}
                    tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                    domain={['dataMin', 'dataMax']}
                />

                <YAxis
                    tick={{ fill: "#39ff14", fontSize: 12 }}
                    axisLine={{ stroke: "#39ff14" }}
                    width="auto"
                />
                <Tooltip />

                <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#39ff14"
                    strokeWidth={2}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </>
    )
}