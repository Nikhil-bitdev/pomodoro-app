import React from 'react';
import { SessionType } from '../../lib/database';

interface TimerDisplayProps {
  time: string;
  sessionType: SessionType;
  progress: number; // 0-1
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({
  time,
  sessionType,
  progress
}) => {
  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return 'stroke-red-500';
      case 'break':
        return 'stroke-green-500';
      case 'longBreak':
        return 'stroke-blue-500';
      default:
        return 'stroke-gray-500';
    }
  };

  const getSessionLabel = () => {
    switch (sessionType) {
      case 'work':
        return 'Focus Time';
      case 'break':
        return 'Short Break';
      case 'longBreak':
        return 'Long Break';
      default:
        return '';
    }
  };

  const circumference = 2 * Math.PI * 140;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      {/* Session Type Label */}
      <div className="mb-4 sm:mb-8">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-400 dark:to-pink-400 text-center">
          {getSessionLabel()}
        </h2>
      </div>

      {/* Circular Progress */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96">
        {/* Background Circle */}
        <svg className="absolute inset-0 transform -rotate-90 drop-shadow-2xl" viewBox="0 0 384 384">
          <circle
            cx="192"
            cy="192"
            r="170"
            stroke="currentColor"
            strokeWidth="12"
            fill="none"
            className="text-gray-100 dark:text-gray-800"
            opacity="0.3"
          />
          {/* Progress Circle */}
          <circle
            cx="192"
            cy="192"
            r="170"
            stroke="url(#gradient)"
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 filter drop-shadow-lg"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" className={getSessionColor()} stopOpacity="1" />
              <stop offset="100%" className={getSessionColor()} stopOpacity="0.6" />
            </linearGradient>
          </defs>
        </svg>

        {/* Timer Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 font-mono tracking-tight">
            {time}
          </div>
        </div>
      </div>
    </div>
  );
};
