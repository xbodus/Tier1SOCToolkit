import {PieChart, Pie, Tooltip, Cell, ResponsiveContainer} from "recharts";


export interface PieDatum {
  name: string;
  value: number;
  [key: string]: any;
}

export default function PieChartVolume({data}:{data:PieDatum[]}) {

    const CustomTooltip = ({ active, payload }: {active?: any, payload?:any}) => {
        if (active && payload && payload.length) {
            return (
                <div style={{ backgroundColor: "#1a1a1a", color: "#39ff14", padding: ".25rem 1rem", border: "2px solid #39ff14", textAlign: "center"}}> {/* Your custom wrapper class */}
                    {`IP: ${payload[0].name}`}<br/>{`Reported: ${payload[0].value}`} times
                </div>
            );
        }
        return null;
    }

    return (
        <div className="graph-container" style={{overflow: "visible"}}>
            <h2 className="chart-title">Top IPs:</h2>
            {data.length === 0 && (<p style={{height: "100%", width: "100%", color: "#39ff14", display: "flex", alignItems: "center", justifyContent: "center"}}>No Data</p>)}
            {data.length > 0 && (
                <ResponsiveContainer width={"100%"} height={"100%"}>
                    <PieChart width={300} height={300} responsive>
                        <Pie
                            data={data}
                            innerRadius="50%"
                            outerRadius="70%"
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
                        <Tooltip content={<CustomTooltip />}/>
                    </PieChart>
                </ResponsiveContainer>)}
        </div>
    )
}