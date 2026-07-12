import React from 'react';
import { StudentData } from '../types';

interface AudioLessonsProps {
  studentData: StudentData;
}

export const AudioLessons: React.FC<AudioLessonsProps> = ({ studentData }) => {
  return (
    <div className="space-y-6 bg-white dark:bg-[#24392c] p-6 rounded-2xl shadow-sm border border-border-soft dark:border-[#4a6552]">
      <div>
        <h2 className="text-lg font-bold font-serif text-sage-dark dark:text-white">🎧 Listening Centre</h2>
        <p className="text-xs text-muted dark:text-[#C7D2C4]">Shared recitation files, slow practice recordings, and repeating exercises.</p>
      </div>

      <div className="space-y-4">
        {(studentData.audioLessons || []).length === 0 ? (
          <p className="text-xs text-muted dark:text-[#C7D2C4] text-center py-6">No audio lessons available yet.</p>
        ) : (
          (studentData.audioLessons || []).map((audio, idx) => (
            <div
              key={idx}
              className="p-4 border border-border-soft dark:border-[#4a6552] rounded-xl bg-soft-bg dark:bg-[#2f4a3a]"
            >
              <h3 className="font-serif font-bold text-sm text-sage-dark dark:text-white mb-3">
                📖 {audio.title}
              </h3>
              <div className="flex flex-wrap gap-2">
                {audio.listenUrl ? (
                  <a
                    href={audio.listenUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-sage hover:bg-sage-dark text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    ▶ Listen to Surah
                  </a>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-lg text-xs font-bold cursor-not-allowed">
                    ▶ Listen to Surah
                  </span>
                )}

                {audio.slowUrl ? (
                  <a
                    href={audio.slowUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-soft-bg3 dark:bg-[#335140] hover:bg-sage text-sage-dark dark:text-white rounded-lg text-xs font-bold transition-colors border border-sage/20"
                  >
                    🐢 Slow Recitation
                  </a>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-lg text-xs font-bold cursor-not-allowed">
                    🐢 Slow Recitation
                  </span>
                )}

                {audio.repeatUrl ? (
                  <a
                    href={audio.repeatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-soft-bg3 dark:bg-[#335140] hover:bg-sage text-sage-dark dark:text-white rounded-lg text-xs font-bold transition-colors border border-sage/20"
                  >
                    🔁 Repeat Practice
                  </a>
                ) : (
                  <span className="px-3 py-1.5 bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 rounded-lg text-xs font-bold cursor-not-allowed">
                    🔁 Repeat Practice
                  </span>
                )}

                {audio.downloadUrl && (
                  <a
                    href={audio.downloadUrl}
                    download
                    className="px-3 py-1.5 bg-white dark:bg-[#1c2b22] hover:bg-sage hover:text-white text-sage-deep dark:text-white rounded-lg text-xs font-bold transition-colors border border-border-soft dark:border-[#4a6552]"
                  >
                    ⬇ Download Audio
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
