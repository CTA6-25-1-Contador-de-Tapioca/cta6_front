'use client';

import { useEffect, useState } from 'react';
import { MyChart } from '@/components/MyChart';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { io, Socket } from 'socket.io-client';

type BagDataPoint = {
  timestamp: string;
  count: number;
  bagType: string;
};
let socket: Socket;
function parseSingleDuration(duration: string): number {
  const match = duration.match(/^(\d+)([smhdw])$/);

  if (!match) {
    throw new Error(`Formato inválido de duração: "${duration}"`);
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
      return value * 7 * 24 * 60 * 60 * 1000;
    default:
      throw new Error(`Unidade inválida: "${unit}"`);
  }
}

function isWithinTolerance(
  date1: Date,
  date2: Date,
  toleranceMs: number
): boolean {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  console.log(diff);
  return diff <= toleranceMs;
}
function getGroupInterval(period: string): string {
  if (period === '1d') return '1m';
  if (period === '7d') return '1d';
  if (period === '30d') return '1d';
  return '1h';
}
export default function Home() {
  const [bagType, setBagType] = useState('800g');
  const [period, setPeriod] = useState('1d');
  const [dados, setDados] = useState<BagDataPoint[]>([]);

  useEffect(() => {
    // Conecta ao socket.io no servidor
    socket = io(process.env.NEXT_PUBLIC_API_URL as string, {
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🟢 Socket conectado:', socket.id);

      // Assina o tipo atual
      socket.emit('subscribe', { bagType });
    });

    // Recebe dados em tempo real
    socket.on('novo-dado', (novoDado: any) => {
      const rawDate = new Date(novoDado.timestamp);

      setDados((prev) => {
        const lastIndex = prev.length - 1;
        const lastItem = prev[lastIndex];
        const isTolerable = isWithinTolerance(
          new Date(lastItem.timestamp),
          rawDate,
          parseSingleDuration(getGroupInterval(period))
        );

        if (lastItem && isTolerable && lastItem.bagType === novoDado.bagType) {
          const atualizado = [...prev];
          atualizado[lastIndex] = {
            ...lastItem,
            count: lastItem.count + 1,
          };
          return atualizado;
        }

        return [
          ...prev,
          {
            timestamp: rawDate.toISOString(),
            count: 1,
            bagType: novoDado.bagType,
          },
        ];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [bagType]);
  useEffect(() => {
    async function fetchDados() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dados?period=${period}&bagType=${bagType}&groupInterval=${getGroupInterval(period)}`
        );
        const json: BagDataPoint[] = await res.json();
        console.log('Dados recebidos:', json);
        setDados(json);
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
      }
    }
    fetchDados();
  }, [bagType, period]);

  return (
    <div className='space-y-6 p-6'>
      <div className='space-y-2'>
        <Label>Tipo de Saco</Label>
        <Select value={bagType} onValueChange={setBagType}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='800g'>800g</SelectItem>
            <SelectItem value='1kg'>1kg</SelectItem>
            <SelectItem value='2kg'>2kg</SelectItem>
          </SelectContent>
        </Select>

        <Label>Periodo</Label>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1d'>1 dia</SelectItem>
            <SelectItem value='30d'>30 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <MyChart data={dados} />
    </div>
  );
}
