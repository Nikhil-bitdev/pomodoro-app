import React, { useEffect } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Volume2, VolumeX, Download, Upload, Trash2 } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import { exportData, importData, clearAllData } from '../../lib/database';

export const SettingsPanel: React.FC = () => {
  const {
    settings,
    setWorkDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setSessionsBeforeLongBreak,
    toggleAutoStartBreaks,
    toggleAutoStartPomodoros,
    toggleSound,
    toggleTheme,
    setDailyGoal,
    initializeTheme
  } = useSettings();

  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  const handleExport = async () => {
    const data = await exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pomodoro-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const data = JSON.parse(text);
        await importData(data);
        window.location.reload();
      }
    };
    input.click();
  };

  const handleClearData = async () => {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      await clearAllData();
      window.location.reload();
    }
  };

  if (!settings) return null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 sm:p-3 bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl sm:rounded-2xl shadow-lg">
          <SettingsIcon className="text-white" size={24} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Settings</h2>
      </div>

      {/* Timer Settings */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Timer Duration</h3>
          <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-medium">Pomodoro</span>
        </div>

        {/* Work Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Work Session</label>
            <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg text-sm font-bold shadow-md">{settings.workDuration} min</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={settings.workDuration}
              onChange={(e) => setWorkDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 rounded-lg appearance-none cursor-pointer slider-thumb-red"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5m</span>
              <span>60m</span>
            </div>
          </div>
        </div>

        {/* Short Break Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Short Break</label>
            <span className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-bold shadow-md">{settings.shortBreakDuration} min</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={settings.shortBreakDuration}
              onChange={(e) => setShortBreakDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg appearance-none cursor-pointer slider-thumb-green"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>1m</span>
              <span>30m</span>
            </div>
          </div>
        </div>

        {/* Long Break Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Long Break</label>
            <span className="px-4 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-bold shadow-md">{settings.longBreakDuration} min</span>
          </div>
          <div className="relative">
            <input
              type="range"
              min="5"
              max="60"
              step="5"
              value={settings.longBreakDuration}
              onChange={(e) => setLongBreakDuration(parseInt(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-lg appearance-none cursor-pointer slider-thumb-blue"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>5m</span>
              <span>60m</span>
            </div>
          </div>
        </div>

        {/* Sessions Before Long Break */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Sessions Before Long Break</label>
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md">{settings.sessionsBeforeLongBreak}</span>
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            {[2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                onClick={() => setSessionsBeforeLongBreak(num)}
                className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold transition-all transform hover:scale-105 ${
                  settings.sessionsBeforeLongBreak === num
                    ? 'bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/30'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Behavior Settings */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Automation</h3>
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs sm:text-sm font-medium">Auto-start</span>
        </div>

        {/* Auto-start Breaks */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Auto-start Breaks</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Automatically start break timer after work session</p>
          </div>
          <button
            onClick={toggleAutoStartBreaks}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
              settings.autoStartBreaks ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                settings.autoStartBreaks ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Auto-start Pomodoros */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex-1">
            <div className="font-medium text-gray-900 dark:text-white">Auto-start Pomodoros</div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Automatically start work session after break</p>
          </div>
          <button
            onClick={toggleAutoStartPomodoros}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
              settings.autoStartPomodoros ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                settings.autoStartPomodoros ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Preferences</h3>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-xs sm:text-sm font-medium">UI</span>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              {settings.theme === 'dark' ? <Moon size={24} className="text-indigo-500" /> : <Sun size={24} className="text-amber-500" />}
              <div>
                <div className="font-medium text-gray-900 dark:text-white">Theme</div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current: {settings.theme === 'dark' ? 'Dark' : 'Light'} mode</p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <div className="flex items-center gap-3 flex-1">
            {settings.soundEnabled ? <Volume2 size={24} className="text-green-500" /> : <VolumeX size={24} className="text-gray-400" />}
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Notification Sounds</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play sound when timer completes</p>
            </div>
          </div>
          <button
            onClick={toggleSound}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all shadow-inner ${
              settings.soundEnabled ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-green-500/30' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                settings.soundEnabled ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Goals */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Daily Target</h3>
          <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs sm:text-sm font-medium">Goal</span>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg sm:rounded-xl border-2 border-amber-200 dark:border-amber-800">
            <div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Daily Pomodoro Goal</div>
              <div className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 mt-1">
                {settings.dailyGoal}
              </div>
            </div>
            <div className="text-3xl sm:text-4xl">🎯</div>
          </div>
          
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
              <button
                key={num}
                onClick={() => setDailyGoal(num)}
                className={`py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-all transform hover:scale-110 ${
                  settings.dailyGoal === num
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 scale-110'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Data</h3>

        <div className="space-y-2 sm:space-y-3">
          <button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <Download size={20} />
            Export Data
          </button>

          <button
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <Upload size={20} />
            Import Data
          </button>

          <button
            onClick={handleClearData}
            className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold shadow-lg transition-all transform hover:scale-105"
          >
            <Trash2 size={20} />
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
};
