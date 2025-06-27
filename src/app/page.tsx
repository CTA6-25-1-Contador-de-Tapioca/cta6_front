'use client';

import { useEffect, useState } from 'react';
import { MyChart } from '@/components/columnChart';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { io, Socket } from 'socket.io-client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type BagDataPoint = {
  timestamp: string;
  count: number;
  bagType: string;
};
let socket: Socket;

export function formatTimeUnit(duration: string): string {
  const match = duration.match(/^(\d+)([smhdw])$/);

  if (!match) {
    return duration; // Retorna o valor original se não conseguir fazer o parse
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  let unitName: string;
  switch (unit) {
    case 's':
      unitName = value === 1 ? 'segundo' : 'segundos';
      break;
    case 'm':
      unitName = value === 1 ? 'minuto' : 'minutos';
      break;
    case 'h':
      unitName = value === 1 ? 'hora' : 'horas';
      break;
    case 'd':
      unitName = value === 1 ? 'dia' : 'dias';
      break;
    case 'w':
      unitName = value === 1 ? 'semana' : 'semanas';
      break;
    default:
      return duration; // Retorna o valor original se a unidade for desconhecida
  }

  return `${value} ${unitName}`;
}

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

function getTimeBucket(date: Date, intervalMs: number): number {
  return Math.floor(date.getTime() / intervalMs);
}

function getGroupInterval(period: string): string {
  if (period === '1d') return '30m';
  if (period === '7d') return '1d';
  if (period === '30d') return '1d';
  return '1h';
}

export default function Home() {
  const [bagType, setBagType] = useState('1kg');
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
        const intervalMs = parseSingleDuration(getGroupInterval(period));
        const newBucket = getTimeBucket(rawDate, intervalMs);

        if (prev.length > 0) {
          const lastItem = prev[prev.length - 1];
          const lastBucket = getTimeBucket(
            new Date(lastItem.timestamp),
            intervalMs
          );

          if (
            lastBucket === newBucket &&
            lastItem.bagType === novoDado.bagType
          ) {
            const atualizado = [...prev];
            atualizado[prev.length - 1] = {
              ...lastItem,
              count: lastItem.count + 1,
            };
            return atualizado;
          }
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
    <div className='space-y-8 p-8'>
      <div className='flex w-full space-x-4'>
        <div className='flex items-center space-x-2'>
          <Label>Tipo do Saco:</Label>

          <Select value={bagType} onValueChange={setBagType}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1kg'>1kg</SelectItem>
              <SelectItem value='800g'>800g</SelectItem>
              <SelectItem value='500g'>500g</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='flex items-center space-x-2'>
          <Label>Périodo:</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className='w-[200px]'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1d'>1 dia</SelectItem>
              <SelectItem value='7d'>7 dias</SelectItem>
              <SelectItem value='30d'>30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex w-full justify-between space-x-8'>
        <Card className='w-full'>
          <CardHeader>
            <CardDescription>Sacos do dia</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              1,250.00
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='w-full'>
          <CardHeader>
            <CardDescription> trocar informação</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              trocar informação
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='w-full'>
          <CardHeader>
            <CardDescription> trocar informação</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              trocar informação
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className='w-full'>
          <CardHeader>
            <CardDescription> trocar informação</CardDescription>
            <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              trocar informação
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <div className='flex h-[calc(100vh-300px)] space-x-8'>
        <Card className='w-1/2'>
          <CardHeader>
            <CardTitle className='text-3xl'>Contagem de Sacos</CardTitle>
            <CardDescription>
              Sacos de {bagType} em um Período de {formatTimeUnit(period)}
            </CardDescription>
          </CardHeader>
          <CardContent className='h-full'>
            <MyChart data={dados} />
          </CardContent>
        </Card>
        <Card className='w-1/2'>
          <CardContent className='h-full'></CardContent>
        </Card>
      </div>
    </div>
  );
}
