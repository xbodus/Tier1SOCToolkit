import {PieChart, Pie, Tooltip, Cell, ResponsiveContainer} from "recharts";


export interface PieDatum {
  name: string;
  value: number;
  [key: string]: any;
}

export default function PieChartVolume({data}:{data:PieDatum[]}) {
    return (
        <div className="graph-container" style={{overflow: "visible"}}>
            <h2 className="chart-title">Top IPs:</h2>
            {data.length === 0 && (<p style={{height: 300, width: 400, color: "#39ff14", display: "flex", alignItems: "center", justifyContent: "center"}}>No Data</p>)}
            {data.length > 0 && (
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <PieChart width={400} height={300} responsive>
                        <Pie
                            data={data}
                            innerRadius="60%"
                            outerRadius="80%"
                            stroke="#39ff14"
                            fill="transparent"
                            paddingAngle={5}
                            dataKey="value"
                            nameKey="name"
                            isAnimationActive={false}
                            label={({ name, value, x, y }) => (
                                <text x={x} y={y} textAnchor="middle" fill="#39ff14" fontSize={12}>
                                  {name} ({value})
                                </text>
                            )}
                        >
                            {data.map((entry) => (
                                <Cell key={`cell-${entry.name}`} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>)}
        </div>
    )
}