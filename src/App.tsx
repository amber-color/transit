import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Calendar } from './components/Calendar';
import { EventModal } from './components/EventModal';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer } from './components/Toast';
import { TransitWarning } from './components/TransitWarning';
import { useEvents } from './hooks/useEvents';
import { useTransitTime } from './hooks/useTransitTime';
import { buildTransitEvents } from './utils/transitCalc';
import type { AppSettings, CalendarEvent, Toast } from './types';
import './index.css';

const SETTINGS_KEY = 'transit_calendar_settings';

function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { workerUrl: '', bufferMinutes: 5 };
  } catch {
    return { workerUrl: '', bufferMinutes: 5 };
  }
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [modalState, setModalState] = useState<
    | { type: 'add'; start: string; end: string }
    | { type: 'edit'; event: CalendarEvent }
    | null
  >(null);

  const { userEvents, addEvent, updateEvent, deleteEvent } = useEvents();
  const { transitMap, loading, fetchAll } = useTransitTime();

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = uuidv4();
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!settings.workerUrl) return;
    const eventsWithLocation = userEvents.filter((e) => e.location);
    if (eventsWithLocation.length < 2) return;

    fetchAll(settings.workerUrl, userEvents).catch(() => {
      addToast('移動時間の取得に失敗しました', 'error');
    });
  }, [userEvents, settings.workerUrl, settings.bufferMinutes, fetchAll, addToast]);

  const transitEvents = buildTransitEvents(userEvents, transitMap, settings.bufferMinutes);
  const allEvents = [...userEvents, ...transitEvents];

  const warningCount = transitEvents.filter((e) => e.extendedProps?.transitWarning).length;

  const handleSaveSettings = (next: AppSettings) => {
    setSettings(next);
    saveSettings(next);
    addToast('設定を保存しました', 'success');
  };

  const handleDateSelect = (start: string, end: string) => {
    setModalState({ type: 'add', start, end });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setModalState({ type: 'edit', event });
  };

  const handleEventDrop = (id: string, start: string, end: string) => {
    updateEvent(id, { start, end });
  };

  const handleSaveEvent = (data: Omit<CalendarEvent, 'id'>) => {
    if (modalState?.type === 'add') {
      addEvent(data);
      addToast('予定を追加しました', 'success');
    } else if (modalState?.type === 'edit') {
      updateEvent(modalState.event.id, data);
      addToast('予定を更新しました', 'success');
    }
    setModalState(null);
  };

  const handleDeleteEvent = () => {
    if (modalState?.type === 'edit') {
      deleteEvent(modalState.event.id);
      addToast('予定を削除しました', 'info');
      setModalState(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🗓️</span>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">移動時間カレンダー</h1>
              <p className="text-xs text-gray-500">予定の場所を設定すると移動時間を自動挿入します</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="animate-spin h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>移動時間を取得中...</span>
              </div>
            )}

            <button
              onClick={() => setShowSettings(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="設定"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        {!settings.workerUrl && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg text-sm flex items-center gap-3">
            <span>⚠️</span>
            <span>Worker URLが未設定のため移動時間の自動計算が無効です。</span>
            <button
              onClick={() => setShowSettings(true)}
              className="ml-auto text-amber-700 underline hover:text-amber-900 whitespace-nowrap"
            >
              設定する →
            </button>
          </div>
        )}

        <TransitWarning count={warningCount} />

        <Calendar
          events={allEvents}
          onDateSelect={handleDateSelect}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />

        <div className="flex flex-wrap gap-4 text-xs text-gray-500 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-indigo-500" />
            <span>通常の予定</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gray-400" />
            <span>移動中（自動挿入）</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>移動時間が足りない区間</span>
          </div>
        </div>
      </main>

      {modalState?.type === 'add' && (
        <EventModal
          initialStart={modalState.start}
          initialEnd={modalState.end}
          onSave={handleSaveEvent}
          onClose={() => setModalState(null)}
        />
      )}

      {modalState?.type === 'edit' && (
        <EventModal
          event={modalState.event}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          onClose={() => setModalState(null)}
        />
      )}

      {showSettings && (
        <SettingsModal
          settings={settings}
          onSave={handleSaveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
