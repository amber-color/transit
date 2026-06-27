import { useState } from 'react';
import type { AppSettings } from '../types';

interface Props {
  settings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

export function SettingsModal({ settings, onSave, onClose }: Props) {
  const [bufferMinutes, setBufferMinutes] = useState(settings.bufferMinutes);

  const handleSave = () => {
    onSave({ bufferMinutes });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">⚙️ 設定</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              移動時間バッファ（分）
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={bufferMinutes}
              onChange={(e) => setBufferMinutes(Number(e.target.value))}
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              取得した移動時間にこの分数を加算します（デフォルト: 5分）
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
            <p className="font-medium text-gray-600">移動時間の取得について</p>
            <p>場所名から OpenStreetMap でジオコーディングし、<a href="https://api.transit.ls8h.com/" target="_blank" rel="noreferrer" className="underline text-indigo-500">transit.ls8h.com API</a> で所要時間を算出します。</p>
            <p>日本の駅名・地名・住所に対応しています。</p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t">
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
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
