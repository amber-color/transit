import { useState } from 'react';
import type { CalendarEvent } from '../types';

interface Props {
  event?: CalendarEvent;
  initialStart?: string;
  initialEnd?: string;
  onSave: (data: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toISO(local: string): string {
  return new Date(local).toISOString();
}

export function EventModal({ event, initialStart, initialEnd, onSave, onDelete, onClose }: Props) {
  const [title, setTitle] = useState(event?.title ?? '');
  const [start, setStart] = useState(
    event ? toLocalInput(event.start) : initialStart ? toLocalInput(initialStart) : ''
  );
  const [end, setEnd] = useState(
    event ? toLocalInput(event.end) : initialEnd ? toLocalInput(initialEnd) : ''
  );
  const [location, setLocation] = useState(event?.extendedProps?.location ?? event?.location ?? '');
  const [memo, setMemo] = useState(event?.extendedProps?.memo ?? event?.memo ?? '');
  const [error, setError] = useState('');

  const isEdit = !!event;

  const handleSave = () => {
    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    if (!start || !end) {
      setError('開始・終了日時を入力してください');
      return;
    }
    if (new Date(start) >= new Date(end)) {
      setError('終了日時は開始日時より後にしてください');
      return;
    }

    onSave({
      title: title.trim(),
      start: toISO(start),
      end: toISO(end),
      location: location.trim() || undefined,
      memo: memo.trim() || undefined,
      extendedProps: {
        location: location.trim() || undefined,
        memo: memo.trim() || undefined,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? '予定を編集' : '予定を追加'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-3 py-2 rounded-lg">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="予定のタイトル"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                開始日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                終了日時 <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              場所
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="例: 渋谷、新宿駅、東京タワー"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              設定すると隣接する予定との移動時間を自動計算します
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              placeholder="メモ（任意）"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div>
            {isEdit && onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg"
              >
                削除
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700"
            >
              {isEdit ? '更新' : '追加'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
