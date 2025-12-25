import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

interface TimerControlsProps {
  status: 'idle' | 'running' | 'paused';
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
}

export const TimerControls: React.FC<TimerControlsProps> = ({
  status,
  onStart,
  onPause,
  onReset,
  onSkip
}) => {
  return (
    <div className="flex items-center justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
      {/* Start/Pause Button */}
      {status === 'running' ? (
        <button
          onClick={onPause}
          className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 hover:shadow-red-500/50"
          aria-label="Pause timer"
        >
          <Pause size={28} className="sm:w-8 sm:h-8" />
        </button>
      ) : (
        <button
          onClick={onStart}
          className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-2xl transition-all transform hover:scale-110 active:scale-95 hover:shadow-green-500/50"
          aria-label="Start timer"
        >
          <Play size={28} className="ml-1 sm:w-8 sm:h-8" />
        </button>
      )}

      {/* Reset Button */}
      <button
        onClick={onReset}
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-full shadow-xl transition-all transform hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Reset timer"
        disabled={status === 'idle'}
      >
        <RotateCcw size={18} className="sm:w-[22px] sm:h-[22px]" />
      </button>

      {/* Skip Button */}
      <button
        onClick={onSkip}
        className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-full shadow-xl transition-all transform hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
        aria-label="Skip to next session"
        disabled={status === 'idle'}
      >
        <SkipForward size={18} className="sm:w-[22px] sm:h-[22px]" />
      </button>
    </div>
  );
};
