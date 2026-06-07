import { useState, useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { getTransitPairs } from '../utils/transitCalc';

const fetchTransitMinutes = async (
  workerUrl: string,
  from: string,
  to: string
): Promise<number | null> => {
  try {
    const res = await fetch(
      `${workerUrl}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    );
    const data = await res.json();
    if (data.error) {
      console.warn('Worker error:', data);
      return null;
    }
    return data.minutes as number;
  } catch (e) {
    console.error('Transit fetch failed:', e);
    return null;
  }
};

export function useTransitTime() {
  const [transitMap, setTransitMap] = useState<Map<string, number | null>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(
    async (workerUrl: string, userEvents: CalendarEvent[]) => {
      if (!workerUrl) return;

      const pairs = getTransitPairs(userEvents);
      if (pairs.length === 0) return;

      // Deduplicate
      const uniquePairs = Array.from(
        new Map(pairs.map((p) => [`${p.from}__${p.to}`, p])).values()
      );

      setLoading(true);
      try {
        const results = await Promise.all(
          uniquePairs.map(async (pair) => {
            const key = `${pair.from}__${pair.to}`;
            const minutes = await fetchTransitMinutes(workerUrl, pair.from, pair.to);
            return { key, minutes };
          })
        );

        setTransitMap((prev) => {
          const next = new Map(prev);
          for (const { key, minutes } of results) {
            next.set(key, minutes);
          }
          return next;
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { transitMap, loading, fetchAll };
}
