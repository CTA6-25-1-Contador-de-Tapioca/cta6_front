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
  period: string;
  className?: string;
}
export function BagColumnChart({ data, period, className }: MyChartProps) {
  // Função para formatar a data/hora com base no período
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);

    if (period === 'today') {
      // Para hoje, mostra apenas a hora (HH:MM)
      return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    } else if (period === '7d') {
      // Para 7 dias, mostra dia da semana e dia do mês
      return date.toLocaleDateString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
      });
    } else if (period === '30d') {
      // Para 30 dias, mostra dia/mês
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
      });
    }

    // Fallback para outros períodos
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Processa os dados para incluir timestamp formatado
  const processedData = data.map((item) => ({
    ...item,
    formattedTimestamp: formatTimestamp(item.timestamp),
  }));
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
          <BarChart data={processedData}>
            <XAxis dataKey='formattedTimestamp' />
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
