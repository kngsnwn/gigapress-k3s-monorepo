import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  // Use a fixed format to ensure consistency between server and client
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatRelativeTime(date: Date): string {
  // This function should only be used on the client side
  if (typeof window === 'undefined') {
    return formatDate(date);
  }
  
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return formatDate(date);
}

let idCounter = 0;

export function generateId(): string {
  // Use a counter instead of random values to ensure consistency
  if (typeof window !== 'undefined') {
    // Client-side: use timestamp + counter
    return `${Date.now()}-${++idCounter}`;
  } else {
    // Server-side: use only counter to avoid timestamp differences
    return `server-${++idCounter}`;
  }
}
