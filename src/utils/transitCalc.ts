import type { CalendarEvent } from '../types';
import { v4 as uuidv4 } from 'uuid';

export function buildTransitEvents(
  userEvents: CalendarEvent[],
  transitMinutesMap: Map<string, number | null>,
  bufferMinutes: number
): CalendarEvent[] {
  const transitEvents: CalendarEvent[] = [];

  // Group events by date (YYYY-MM-DD)
  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of userEvents) {
    const dateKey = ev.start.slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(ev);
  }

  for (const [, dayEvents] of byDate) {
    // Sort by start time
    const sorted = [...dayEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];

      if (!current.location || !next.location) continue;

      const key = `${current.location}__${next.location}`;
      if (!transitMinutesMap.has(key)) continue;

      const rawMinutes = transitMinutesMap.get(key);
      if (rawMinutes === null || rawMinutes === undefined) continue;

      const totalMinutes = rawMinutes + bufferMinutes;
      const transitStart = new Date(current.end);
      const transitEnd = new Date(transitStart.getTime() + totalMinutes * 60 * 1000);
      const nextStart = new Date(next.start);

      const isWarning = transitEnd > nextStart;

      transitEvents.push({
        id: `transit_${uuidv4()}`,
        title: `🚃 移動中（${totalMinutes}分）`,
        start: transitStart.toISOString(),
        end: transitEnd.toISOString(),
        isTransit: true,
        color: isWarning ? '#EF4444' : '#9CA3AF',
        editable: false,
        extendedProps: {
          isTransit: true,
          transitWarning: isWarning,
        },
      });
    }
  }

  return transitEvents;
}

export function getTransitPairs(userEvents: CalendarEvent[]): Array<{ from: string; to: string }> {
  const pairs: Array<{ from: string; to: string }> = [];

  const byDate = new Map<string, CalendarEvent[]>();
  for (const ev of userEvents) {
    if (!ev.location) continue;
    const dateKey = ev.start.slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey)!.push(ev);
  }

  for (const [, dayEvents] of byDate) {
    const sorted = [...dayEvents].sort(
      (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      if (current.location && next.location) {
        pairs.push({ from: current.location, to: next.location });
      }
    }
  }

  return pairs;
}
