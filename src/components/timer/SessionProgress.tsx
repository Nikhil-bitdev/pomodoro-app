import React from 'react';

interface SessionProgressProps {
  sessionCount: number;
  sessionsBeforeLongBreak: number;
}

export const SessionProgress: React.FC<SessionProgressProps> = ({
  sessionCount,
  sessionsBeforeLongBreak
}) => {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      {Array.from({ length: sessionsBeforeLongBreak }, (_, i) => (
        <div
          key={i}
          className={`w-4 h-4 rounded-full transition-all duration-500 ${
            i < sessionCount
              ? 'bg-gradient-to-br from-red-500 to-pink-600 scale-125 shadow-lg shadow-red-500/50'
              : 'bg-gray-200 dark:bg-gray-700 hover:scale-110'
          }`}
          aria-label={`Session ${i + 1}${i < sessionCount ? ' completed' : ''}`}
        />
      ))}
      <span className="ml-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        {sessionCount} / {sessionsBeforeLongBreak}
      </span>
    </div>
  );
};
