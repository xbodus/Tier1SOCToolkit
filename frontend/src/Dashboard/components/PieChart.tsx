import {PieChart, Pie, Tooltip, Cell} from "recharts";


export interface PieDatum {
  name: string;
  value: number;
  [key: string]: any;
}

export default function PieChartVolume({data}:{data:PieDatum[]}) {

    return (
        <div>
            <PieChart width={350} height={350} responsive>
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
        </div>
    )
}