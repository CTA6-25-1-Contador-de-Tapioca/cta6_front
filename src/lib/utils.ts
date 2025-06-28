import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BagDataPoint = {
  timestamp: string;
  count: number;
  bagType: string;
};

export function formatTimeUnit(duration: string): string {
  if (duration === 'today') {
    return 'Hoje';
  }
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

export function parseSingleDuration(duration: string): number {
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

export function getTimeBucket(date: Date, intervalMs: number): number {
  return Math.floor(date.getTime() / intervalMs);
}

export function getGroupInterval(period: string): string {
  if (period === '1d') return '30m';
  if (period === '7d') return '1d';
  if (period === '30d') return '1d';
  return '1h';
}
