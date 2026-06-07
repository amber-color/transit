import { useRef, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { DateSelectArg, EventClickArg, EventDropArg, EventContentArg } from '@fullcalendar/core';
import type { CalendarEvent } from '../types';

interface Props {
  events: CalendarEvent[];
  onDateSelect: (start: string, end: string) => void;
  onEventClick: (event: CalendarEvent) => void;
  onEventDrop: (id: string, start: string, end: string) => void;
}

function EventContent({ info }: { info: EventContentArg }) {
  const isTransit = info.event.extendedProps?.isTransit;
  const isWarning = info.event.extendedProps?.transitWarning;
  const location = info.event.extendedProps?.location;

  if (isTransit) {
    return (
      <div className={`px-1 py-0.5 text-xs font-medium truncate ${isWarning ? 'text-white' : 'text-gray-600'}`}>
        {info.event.title}
      </div>
    );
  }

  return (
    <div className="px-1 py-0.5 overflow-hidden h-full">
      <div className="text-xs font-semibold truncate text-white">{info.event.title}</div>
      {location && (
        <div className="text-xs text-white/80 truncate">📍 {location}</div>
      )}
    </div>
  );
}

export function Calendar({ events, onDateSelect, onEventClick, onEventDrop }: Props) {
  const calendarRef = useRef<FullCalendar>(null);

  const handleDateSelect = useCallback(
    (selectInfo: DateSelectArg) => {
      onDateSelect(selectInfo.startStr, selectInfo.endStr);
      selectInfo.view.calendar.unselect();
    },
    [onDateSelect]
  );

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const isTransit = clickInfo.event.extendedProps?.isTransit;
      if (isTransit) return;

      const ev = events.find((e) => e.id === clickInfo.event.id);
      if (ev) onEventClick(ev);
    },
    [events, onEventClick]
  );

  const handleEventDrop = useCallback(
    (dropInfo: EventDropArg) => {
      const isTransit = dropInfo.event.extendedProps?.isTransit;
      if (isTransit) {
        dropInfo.revert();
        return;
      }
      onEventDrop(
        dropInfo.event.id,
        dropInfo.event.startStr,
        dropInfo.event.endStr
      );
    },
    [onEventDrop]
  );

  const fcEvents = events.map((ev) => ({
    id: ev.id,
    title: ev.title,
    start: ev.start,
    end: ev.end,
    color: ev.color ?? '#4F46E5',
    editable: ev.editable !== false && !ev.isTransit,
    extendedProps: {
      isTransit: ev.isTransit,
      transitWarning: ev.extendedProps?.transitWarning,
      location: ev.location ?? ev.extendedProps?.location,
      memo: ev.memo ?? ev.extendedProps?.memo,
    },
    classNames: ev.isTransit ? ['fc-event-transit'] : [],
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <FullCalendar
        ref={calendarRef}
        plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        buttonText={{
          today: '今日',
          month: '月',
          week: '週',
          day: '日',
        }}
        locale="ja"
        height="auto"
        events={fcEvents}
        selectable={true}
        selectMirror={true}
        editable={true}
        dayMaxEvents={true}
        select={handleDateSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventContent={(info) => <EventContent info={info} />}
        slotMinTime="06:00:00"
        slotMaxTime="24:00:00"
        allDaySlot={false}
        nowIndicator={true}
        scrollTime="08:00:00"
      />
    </div>
  );
}
