export interface StatusConfigType {
  key: string;
  label: string;
  emoji: string;
  bg: string;
  text: string;
}

export const CALENDAR_STATUSES: StatusConfigType[] = [
  { key: 'completed', label: 'Completed', emoji: '🟢', bg: '#3fa34d', text: '#ffffff' },
  { key: 'missed', label: 'Missed', emoji: '🔴', bg: '#d64545', text: '#ffffff' },
  { key: 'rescheduled', label: 'Rescheduled', emoji: '🔵', bg: '#3b82c4', text: '#ffffff' },
  { key: 'holiday', label: 'Holiday', emoji: '🟡', bg: '#e8c948', text: '#3c3020' },
  { key: 'assessment', label: 'Assessment / Revision', emoji: '🟣', bg: '#9b59b6', text: '#ffffff' },
  { key: 'upcoming', label: 'Upcoming', emoji: '⚪', bg: '#d8ded9', text: '#3c5c4a' }
];

export function getStatusConfig(key: string | null | undefined): StatusConfigType | null {
  if (!key) return null;
  return CALENDAR_STATUSES.find(s => s.key === key) || null;
}
