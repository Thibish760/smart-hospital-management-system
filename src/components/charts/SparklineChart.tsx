import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineChartProps {
  data: number[];
  positive?: boolean;
}

export function SparklineChart({ data, positive = true }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({ index, value }));
  const color = positive ? '#22C55E' : '#EF4444';

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
