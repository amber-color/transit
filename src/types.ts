export interface CalendarEvent {
  id: string;
  title: string;
  start: string;       // ISO8601
  end: string;         // ISO8601
  location?: string;   // 駅名・地名
  memo?: string;
  isTransit?: boolean;
  color?: string;
  editable?: boolean;
  extendedProps?: {
    location?: string;
    memo?: string;
    isTransit?: boolean;
    transitWarning?: boolean;
  };
}

export interface AppSettings {
  workerUrl: string;
  bufferMinutes: number;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
