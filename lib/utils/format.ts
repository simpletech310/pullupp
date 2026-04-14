import { format, formatDistanceToNow, isToday, isTomorrow, differenceInDays } from 'date-fns';

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return format(date, 'EEE, MMM d');
}

export function formatDateTime(dateStr: string, timeStr?: string): string {
  const date = new Date(dateStr);
  const formatted = format(date, 'EEE, MMM d, yyyy');
  return timeStr ? `${formatted} at ${timeStr}` : formatted;
}

export function formatTimeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactNumber(num: number): string {
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`;
  }
  return num.toString();
}

export function getEventCountdown(dateStr: string): string {
  const eventDate = new Date(dateStr);
  if (isToday(eventDate)) return 'Today!';
  if (isTomorrow(eventDate)) return 'Tomorrow';
  const days = differenceInDays(eventDate, new Date());
  if (days > 0 && days <= 30) return `In ${days} days`;
  return format(eventDate, 'MMM d');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
