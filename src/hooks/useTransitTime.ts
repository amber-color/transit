import { useState, useCallback } from 'react';
import type { CalendarEvent } from '../types';
import { getTransitPairs } from '../utils/transitCalc';

const TRANSIT_API = 'https://api.transit.ls8h.com/api/v1/plan';
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

// Module-level caches survive re-renders
const geoCache = new Map<string, { lat: number; lon: number } | null>();
const transitCache = new Map<string, number | null>();

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function geocode(location: string): Promise<{ lat: number; lon: number } | null> {
  if (geoCache.has(location)) return geoCache.get(location)!;

  try {
    const url = `${NOMINATIM_API}?q=${encodeURIComponent(location)}&format=json&limit=1&accept-language=ja&countrycodes=jp`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'TransitCalendarApp/1.0' },
    });
    const data = await res.json();
    if (!data.length) {
      geoCache.set(location, null);
      return null;
    }
    const result = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    geoCache.set(location, result);
    return result;
  } catch {
    return null;
  }
}

async function fetchTransitMinutes(
  from: { lat: number; lon: number },
  to: { lat: number; lon: number }
): Promise<number | null> {
  const url =
    `${TRANSIT_API}?from=geo:${from.lat.toFixed(4)},${from.lon.toFixed(4)}` +
    `&to=geo:${to.lat.toFixed(4)},${to.lon.toFixed(4)}`;

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();

  const journeys: Array<{ durationSecs: number; legs: Array<{ kind: string }> }> =
    data.journeys ?? [];

  // Exclude walk-only journeys
  const transit = journeys.filter((j) => j.legs.some((l) => l.kind === 'transit'));
  if (!transit.length) return null;

  const minSecs = Math.min(...transit.map((j) => j.durationSecs));
  return Math.ceil(minSecs / 60);
}

export function useTransitTime() {
  const [transitMap, setTransitMap] = useState<Map<string, number | null>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async (userEvents: CalendarEvent[]) => {
    const pairs = getTransitPairs(userEvents);
    if (!pairs.length) return;

    const unique = Array.from(
      new Map(pairs.map((p) => [`${p.from}__${p.to}`, p])).values()
    );

    // Only fetch pairs not already cached
    const toFetch = unique.filter((p) => !transitCache.has(`${p.from}__${p.to}`));
    if (!toFetch.length) {
      // Sync from transitCache into state
      setTransitMap((prev) => {
        const next = new Map(prev);
        for (const p of unique) {
          const key = `${p.from}__${p.to}`;
          if (transitCache.has(key)) next.set(key, transitCache.get(key)!);
        }
        return next;
      });
      return;
    }

    setLoading(true);
    try {
      for (let i = 0; i < toFetch.length; i++) {
        const pair = toFetch[i];
        const key = `${pair.from}__${pair.to}`;

        if (i > 0) await sleep(1100); // Nominatim rate limit: 1 req/sec

        const [fromGeo, toGeo] = await Promise.all([geocode(pair.from), geocode(pair.to)]);
        if (!fromGeo || !toGeo) {
          transitCache.set(key, null);
          continue;
        }

        const minutes = await fetchTransitMinutes(fromGeo, toGeo);
        transitCache.set(key, minutes);
      }
    } finally {
      setTransitMap((prev) => {
        const next = new Map(prev);
        for (const p of unique) {
          const key = `${p.from}__${p.to}`;
          if (transitCache.has(key)) next.set(key, transitCache.get(key)!);
        }
        return next;
      });
      setLoading(false);
    }
  }, []);

  return { transitMap, loading, fetchAll };
}
