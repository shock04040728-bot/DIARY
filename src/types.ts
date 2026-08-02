export type Tab = 'diary' | 'timetable' | 'todos' | 'goals' | 'bucketList' | 'settings';

export interface UserSettings {
  location: string;
  font: string;
  theme: 'light' | 'dark';
}

export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  date: string; // ISO string
  images: string[]; // Base64
  createdAt: number;
}

export interface TimetableEntry {
  id: string;
  day: string; // Mon, Tue, etc.
  period: string; // e.g., "1교시", "2교시"
  subject: string;
  time: string; // e.g., "09:00~10:00"
  image?: string;
}

export interface TodoEntry {
  id: string;
  date: string; // ISO string (YYYY-MM-DD)
  text: string;
  completed: boolean;
  createdAt: number;
}


export interface GoalEntry {
  id: string;
  text: string;
  progress: number;
  createdAt: number;
}

export interface BucketListEntry {
  id: string;
  title: string;
  image?: string;
  completed: boolean;
  createdAt: number;
}
