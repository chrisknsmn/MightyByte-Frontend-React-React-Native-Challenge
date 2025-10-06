// src/utils/layout.ts
import { useEffect, useState } from 'react';

export function useNumColumns(): number {
  const [width, setWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (width >= 1400) return 6;
  if (width >= 1200) return 5;
  if (width >= 992) return 4;
  if (width >= 768) return 3;
  if (width >= 520) return 2;
  return 1;
}
