import React from 'react';
import { StudentData, User } from '../types';

interface OverviewProps {
  user: User;
  studentData: StudentData;
}

export const Overview: React.FC<OverviewProps> = ({ user, studentData }) => {
  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  };

  const hasPhoto = studentData.photo;

  const getLocalDateString = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const r = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${r}`;
  };

  const todayStr = getLocalDateString();
  const hasStreakToday = studentData.lastStreakUpdateDate === todayStr;

  return (
    <div className="space-y-6">
      {/* Student Profile Overview */}
      <div className="bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] flex flex-col md:flex-row items-center gap-6">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {hasPhoto ? (
            <div
              className="w-24 h-24 rounded-full border-4 border-sage shadow-md"
              style={{
                backgroundImage: `url(${studentData.photo})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-sage text-white text-3xl font-bold flex items-center justify-center border-4 border-sage shadow-md select-none font-serif">
              {getInitials(user.name)}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <h2 className="text-2xl font-serif font-bold text-sage-dark dark:text-[#E8ECE7]">
            {user.name}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-sage-deep dark:text-[#C7D2C4]">
            <p>
              <strong className="text-sage font-semibold">Age:</strong> {studentData.age || 'Not set'}
            </p>
            <p>
              <strong className="text-sage font-semibold">Level:</strong> {studentData.level || 'Not set'}
            </p>
            <p>
              <strong className="text-sage font-semibold">Surahs Completed:</strong> {studentData.surahsCompleted || 0}
            </p>
            <p>
              <strong className="text-sage font-semibold">Overall Attendance:</strong> {studentData.attendance}%
            </p>
          </div>
        </div>
      </div>

      {/* Progress Circles Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Study Progress */}
        <div className="bg-white dark:bg-[#24392c] p-5 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] flex flex-col items-center justify-center text-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4] mb-3">Overall Progress</h3>
          
          <div className="relative w-28 h-28 flex items-center justify-center mb-2">
            <svg className="w-full h-full -rotate-90">
              <circle
                className="text-soft-bg dark:text-[#2f4a3a] stroke-current"
                strokeWidth="8"
                cx="56"
                cy="56"
                r="48"
                fill="none"
              />
              <circle
                className="text-sage stroke-current"
                strokeWidth="8"
                strokeLinecap="round"
                cx="56"
                cy="56"
                r="48"
                fill="none"
                strokeDasharray={2 * Math.PI * 48}
                strokeDashoffset={2 * Math.PI * 48 * (1 - studentData.progress / 100)}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <span className="absolute text-xl font-serif font-bold text-sage-deep dark:text-white">
              {studentData.progress}%
            </span>
          </div>
          <p className="text-xs text-muted dark:text-[#C7D2C4]">Curricular milestones complete</p>
        </div>

        {/* Current Study Focus */}
        <div className="bg-white dark:bg-[#24392c] p-5 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4] mb-3">Current Study Focus</h3>
            <p className="text-lg font-serif font-bold text-sage-dark dark:text-[#E8ECE7] mb-1">
              📖 {studentData.surah}
            </p>
          </div>
          <p className="text-xs text-muted dark:text-[#C7D2C4] border-t border-soft-bg dark:border-[#2f4a3a] pt-3 mt-4">
            Curated custom by Ustadha Sofiya.
          </p>
        </div>

        {/* Current Active Goal */}
        <div className="bg-white dark:bg-[#24392c] p-5 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4] mb-3">Current Active Goal</h3>
            <p className="text-sm font-semibold text-sage-deep dark:text-[#C7D2C4] leading-relaxed">
              🎯 {studentData.goal}
            </p>
          </div>
          <p className="text-xs text-muted dark:text-[#C7D2C4] border-t border-soft-bg dark:border-[#2f4a3a] pt-3 mt-4">
            Daily practice recommended.
          </p>
        </div>

        {/* Daily Study Streak */}
        <div className="bg-white dark:bg-[#24392c] p-5 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552] flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted dark:text-[#C7D2C4] mb-3">Daily Study Streak</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl animate-pulse">🔥</span>
              <span className="text-2xl font-serif font-bold text-sage-dark dark:text-[#E8ECE7]">
                {studentData.streakCount || 0} {studentData.streakCount === 1 ? 'Day' : 'Days'}
              </span>
            </div>
            <p className="text-xs text-sage-deep dark:text-[#C7D2C4] mt-1 font-medium leading-normal">
              {hasStreakToday ? 'Streak active today! Great job! 🎉' : 'Log in or complete a task to maintain your streak today! ⚡'}
            </p>
          </div>
          <p className="text-xs text-muted dark:text-[#C7D2C4] border-t border-soft-bg dark:border-[#2f4a3a] pt-3 mt-4">
            Last active: {studentData.lastStreakUpdateDate || 'No record'}
          </p>
        </div>
      </div>
    </div>
  );
};
