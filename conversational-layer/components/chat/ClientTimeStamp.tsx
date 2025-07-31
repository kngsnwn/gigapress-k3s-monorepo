'use client'

import { useState, useEffect } from 'react';
import { formatRelativeTime } from '@/lib/utils';

interface ClientTimeStampProps {
  date: Date;
  className?: string;
}

export default function ClientTimeStamp({ date, className }: ClientTimeStampProps) {
  const [mounted, setMounted] = useState(false);
  const [timeString, setTimeString] = useState('');

  useEffect(() => {
    setMounted(true);
    setTimeString(formatRelativeTime(date));
    
    // Update time string every minute for relative times
    const interval = setInterval(() => {
      setTimeString(formatRelativeTime(date));
    }, 60000);

    return () => clearInterval(interval);
  }, [date]);

  if (!mounted) {
    // Return a placeholder that matches the expected content structure
    return <span className={className} style={{ visibility: 'hidden' }}>just now</span>;
  }

  return <span className={className}>{timeString}</span>;
}