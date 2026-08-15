import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO, isValid } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return dateString;
    return format(date, 'MMM d, yyyy');
  } catch {
    return dateString;
  }
}

export function isExpiringSoon(dateString?: string | null, daysThreshold = 30): boolean {
  if (!dateString) return false;
  try {
    const target = parseISO(dateString);
    if (!isValid(target)) return false;
    const now = new Date();
    const diffTime = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= daysThreshold;
  } catch {
    return false;
  }
}

export function isPastDate(dateString?: string | null): boolean {
  if (!dateString) return false;
  try {
    const target = parseISO(dateString);
    if (!isValid(target)) return false;
    return target < new Date();
  } catch {
    return false;
  }
}
