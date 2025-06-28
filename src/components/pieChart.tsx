'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

type BagCountData = {
  bagType: string;
  count: number;
};

interface BagPieChartProps {
  data: BagCountData[];
}

const COLORS = [
  '#4285F4',
  '#34A853',
  '#FBBC05',
  '#EA4335',
  '#A142F4',
  '#46BDC6',
];

export function BagPieChart({ data }: BagPieChartProps) {
  return (
    <div className='flex flex-col items-center gap-6'>
      <div className='h-[300px] w-full'>
        <ResponsiveContainer width='100%' height='100%'>
          <PieChart>
            <Pie
              dataKey='count'
              nameKey='bagType'
              data={data}
              cx='50%'
              cy='50%'
              outerRadius={100}
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              paddingAngle={3}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${value} sacos`} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className='w-full space-y-1 px-4'>
        {data.map((item, index) => (
          <li
            key={item.bagType}
            className='flex items-center justify-between text-sm'
          >
            <div className='flex items-center gap-2'>
              <span
                className='h-3 w-3 rounded-full'
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className='text-muted-foreground'>{item.bagType}</span>
            </div>
            <span className='font-medium'>{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
