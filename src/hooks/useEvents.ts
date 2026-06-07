import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { CalendarEvent } from '../types';

const STORAGE_KEY = 'transit_calendar_events';

function loadEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveEvents(events: CalendarEvent[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function useEvents() {
  const [userEvents, setUserEvents] = useState<CalendarEvent[]>(loadEvents);

  const addEvent = useCallback((ev: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = { ...ev, id: uuidv4() };
    setUserEvents((prev) => {
      const next = [...prev, newEvent];
      saveEvents(next);
      return next;
    });
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<CalendarEvent>) => {
    setUserEvents((prev) => {
      const next = prev.map((ev) => (ev.id === id ? { ...ev, ...updates } : ev));
      saveEvents(next);
      return next;
    });
  }, []);

  const deleteEvent = useCallback((id: string) => {
    setUserEvents((prev) => {
      const next = prev.filter((ev) => ev.id !== id);
      saveEvents(next);
      return next;
    });
  }, []);

  return { userEvents, addEvent, updateEvent, deleteEvent };
}
