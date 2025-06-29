'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
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
export function BagColumnChart({ data, className }: MyChartProps) {
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
      <div className='w-full'>
        <ResponsiveContainer width='95%' height='90%'>
          <BarChart data={data}>
            <XAxis dataKey='timestamp' />
            <YAxis />
            <CartesianGrid />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey='count' fill='#4f46e5' radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
