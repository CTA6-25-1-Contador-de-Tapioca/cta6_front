'use client';

import { useEffect, useState } from 'react';
import { BagColumnChart } from '@/components/columnChart';
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
import {
  BagDataPoint,
  parseSingleDuration,
  getGroupInterval,
  getTimeBucket,
  formatTimeUnit,
} from '@/lib/utils';
import { BagPieChart } from '@/components/pieChart';
import { Package } from 'lucide-react';

let socket: Socket;

export default function Home() {
  const [bagType, setBagType] = useState('1kg');
  const [period, setPeriod] = useState('today');
  const [dados, setDados] = useState<BagDataPoint[]>([]);
  const [dailyPackageCount, setDailyPackageCount] = useState(0);
  const [byBagType, setByBagType] = useState<BagDataPoint[]>([]);

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

    socket.on('daily', (data: { count: number }) => {
      setDailyPackageCount((prev) => {
        return data.count + prev;
      });
    });

    socket.on('byBagType', (data: { count: number; bagType: string }) => {
      setByBagType((prev) => {
        const updatedData = prev.map((item) => {
          if (item.bagType === data.bagType) {
            return {
              ...item,
              count: item.count + data.count,
            };
          }
          return item;
        });
        return updatedData;
      });
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
  }, [bagType, period]);
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch historical data
        const historyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dados?period=${period}&bagType=${bagType}&groupInterval=${getGroupInterval(period)}`
        );
        const historyJson: BagDataPoint[] = await historyRes.json();
        setDados(historyJson);

        // Fetch daily count
        const dailyRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dados/daily?bagType=${bagType}`
        );
        const dailyJson = await dailyRes.json();
        setDailyPackageCount(dailyJson.countToday);

        // Fetch bag type distribution
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
      }
    }
    fetchData();
  }, [bagType, period]);

  useEffect(() => {
    async function fetchByBagType() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dados/byBagType?period=${period}`
        );
        const json: BagDataPoint[] = await res.json();
        setByBagType(json);
      } catch (err) {
        console.error('Erro ao buscar distribuição por tipo de saco:', err);
      }
    }
    fetchByBagType();
  }, [period]);

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
              <SelectItem value='today'>Hoje</SelectItem>
              <SelectItem value='7d'>7 dias</SelectItem>
              <SelectItem value='30d'>30 dias</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className='flex w-full justify-between space-x-8'>
        <Card className='w-full'>
          <CardHeader>
            <CardDescription className='flex w-full items-center justify-between'>
              <p>Sacos do dia</p>

              <Package className='h-6 w-6' />
            </CardDescription>
            <CardTitle className='flex items-center gap-2 text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
              {dailyPackageCount} sacos
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
        <Card className='w-full space-y-8'>
          <CardHeader>
            <CardTitle className='text-3xl'>Contagem de Sacos</CardTitle>
            <CardDescription>
              Sacos de {bagType} no Período de {formatTimeUnit(period)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BagColumnChart data={dados} />
          </CardContent>
        </Card>
        <Card className='w-1/2 space-y-8'>
          <CardHeader>
            <CardTitle className='text-3xl'>Distribuição por Tipo</CardTitle>
            <CardDescription>
              Distribuição dos tipos de sacos no período de{' '}
              {formatTimeUnit(period)}
            </CardDescription>
          </CardHeader>
          <CardContent className='h-full'>
            <BagPieChart data={byBagType} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
