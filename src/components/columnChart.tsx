'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';

type BagDataPoint = {
  timestamp: string;
  count: number;
  bagType: string;
};

interface MyChartProps {
  data: BagDataPoint[];
  className?: string;
}

export function MyChart({ data, className }: MyChartProps) {
  return (
    <ChartContainer
      className={`${className}`}
      config={{
        xAxis: {
          label: 'Horário',
        },
        yAxis: {
          label: 'Quantidade',
        },
      }}
    >
      <BarChart data={data}>
        <XAxis dataKey='timestamp' />
        <YAxis />
        <CartesianGrid />
        <Tooltip content={<ChartTooltipContent />} />
        <Bar dataKey='count' fill='#4f46e5' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
