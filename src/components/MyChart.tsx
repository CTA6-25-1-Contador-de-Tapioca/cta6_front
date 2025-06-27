'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from './ui/chart';

type BagDataPoint = {
  timestamp: string;
  count: number;
  bagType: string;
};

interface MyChartProps {
  data: BagDataPoint[];
}

export function MyChart({ data }: MyChartProps) {
  return (
    <ChartContainer
      className='h-[600px] w-full'
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
        <Tooltip content={<ChartTooltipContent />} />
        <Bar dataKey='count' fill='#4f46e5' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
