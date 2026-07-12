export type UserRole = 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password?: string;
  role: UserRole;
  name: string;
}

export interface HomeworkItem {
  text: string;
  done: boolean;
}

export interface RewardItem {
  text: string;
  date: string;
}

export interface NoteItem {
  text: string;
  date: string;
}

export interface MissedClass {
  date: string;
  reason: string;
}

export interface TajweedRule {
  name: string;
  learned: boolean;
}

export interface ResourceItem {
  category: string;
  fileType: 'PDF' | 'Word' | 'Audio' | 'Video' | 'Website' | 'Image' | 'Other';
  title: string;
  url: string;
  description?: string;
  addedDate?: string;
  views?: number;
  downloads?: number;
}

export interface AudioLesson {
  title: string;
  listenUrl?: string;
  slowUrl?: string;
  repeatUrl?: string;
  downloadUrl?: string;
}

export interface DuaItem {
  title: string;
  text: string;
}

export interface CertificateItem {
  title: string;
  date: string;
  instructor?: string;
  signature?: string;
  duaText?: string;
}

export interface AssignmentItem {
  id: string;
  text: string;
  completed: boolean;
  addedDate: string;
  orderIndex?: number;
}

export interface CalendarEventHomework {
  text: string;
  dueDate: string;
  completed: boolean;
}

export interface CalendarEvent {
  status: 'completed' | 'missed' | 'rescheduled' | 'holiday' | 'assessment' | 'upcoming' | null;
  lesson: string;
  focusArea: string;
  homework: CalendarEventHomework | null;
  audio: string;
  teacherNote: string;
  parentNote: string;
  reason?: string; // e.g. 'Student Absent'
  notes?: string;  // e.g. 'Family travelling'
  excellent?: boolean; // star indicator
  time?: string;
  teacher?: string;
}

export interface MainGoal {
  text: string;
  completed: boolean;
}

export interface MonthlyPlan {
  days: Record<string, any>;
  goals: any[];
  mainGoal: MainGoal;
}

export interface StudentData {
  surah: string;
  goal: string;
  progress: number;
  age: string | number;
  level: string;
  surahsCompleted: number;
  homework: HomeworkItem[];
  rewards: RewardItem[];
  parentNotes: NoteItem[];
  teacherNotes: NoteItem[];
  dua: string;
  parentCornerEnabled: boolean;
  attendance: number;
  missedClasses: MissedClass[];
  tajweedRules: TajweedRule[];
  resources: ResourceItem[];
  classLink: string;
  classTimings: string;
  recurringDays: number[];
  recurringTime: string;
  recurringTopic: string;
  cancelledDates: string[];
  audioLessons: AudioLesson[];
  duas: DuaItem[];
  monthlyPlan: Record<string, MonthlyPlan>;
  calendarEvents: Record<string, CalendarEvent>;
  assignments: AssignmentItem[];
  weeklyPlan: Record<string, { goals: { text: string; done: boolean }[] }>;
  photo: string;
  resourceCategories: string[];
  selfNotes: NoteItem[];
  certificates: CertificateItem[];
  tajweedSubtitle?: string;
  streakCount?: number;
  lastStreakUpdateDate?: string;
  zoomMeetingId?: string;
  zoomPasscode?: string;
  zoomMeetingLink?: string;
}

export interface Announcement {
  text: string;
  date: string;
}
