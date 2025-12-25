import { useState, useEffect } from 'react';
import { Timer, CheckSquare, BarChart3, Settings, Bell } from 'lucide-react';
import { usePomodoro } from './hooks/usePomodoro.ts';
import { useTasks } from './hooks/useTasks';
import { TimerDisplay } from './components/timer/TimerDisplay';
import { TimerControls } from './components/timer/TimerControls';
import { SessionProgress } from './components/timer/SessionProgress';
import { TaskList } from './components/tasks/TaskList';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { requestNotificationPermission } from './lib/notifications';
import { db } from './lib/database';

type Tab = 'timer' | 'tasks' | 'analytics' | 'settings';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('timer');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const {
    timeRemaining,
    status,
    sessionType,
    sessionCount,
    formattedTime,
    start,
    pause,
    reset,
    skip,
    settings
  } = usePomodoro();

  const {
    todayTasks,
    completeTask,
    uncompleteTask,
    deleteTask,
    updateTask
  } = useTasks();

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Calculate progress for circular timer
  const totalTime = settings
    ? (sessionType === 'work'
        ? settings.workDuration
        : sessionType === 'break'
        ? settings.shortBreakDuration
        : settings.longBreakDuration) * 60
    : 1500;
  const progress = 1 - timeRemaining / totalTime;

  const handleStartTimer = () => {
    start(selectedTaskId || undefined);
  };

  const handleTaskToggle = async (id: number) => {
    const task = await db.tasks.get(id);
    if (task?.isCompleted) {
      uncompleteTask(id);
    } else {
      completeTask(id);
    }
  };

  const tabs = [
    { id: 'timer' as Tab, label: 'Timer', icon: Timer },
    { id: 'tasks' as Tab, label: 'Tasks', icon: CheckSquare },
    { id: 'analytics' as Tab, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as Tab, label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-pink-600 dark:from-red-400 dark:to-pink-400 flex items-center gap-1.5 sm:gap-3">
              <div className="p-1 sm:p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg sm:rounded-2xl shadow-lg">
                <Timer className="text-white" size={20} />
              </div>
              Pomodoro Focus
            </h1>
            
            {/* Daily Goal Progress */}
            {settings && (
              <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                <Bell size={14} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Today: 0 / {settings.dailyGoal}</span>
                <span className="sm:hidden">0/{settings.dailyGoal}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <div className="flex justify-between sm:justify-start sm:space-x-1 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex-1 sm:flex-initial shrink-0 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-300 relative ${
                  activeTab === id
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <Icon size={16} className="sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-sm">{label}</span>
                {activeTab === id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-pink-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-8 h-full">
        {activeTab === 'timer' && (
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3 sm:p-8 lg:p-12 flex-1 flex flex-col justify-center">
              <TimerDisplay
                time={formattedTime}
                sessionType={sessionType}
                progress={progress}
              />
              
              <TimerControls
                status={status}
                onStart={handleStartTimer}
                onPause={pause}
                onReset={reset}
                onSkip={skip}
              />

              <SessionProgress
                sessionCount={sessionCount}
                sessionsBeforeLongBreak={settings?.sessionsBeforeLongBreak || 4}
              />

              {/* Current Task */}
              {selectedTaskId && (
                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Working on:</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {todayTasks?.find(t => t.id === selectedTaskId)?.title}
                  </p>
                </div>
              )}

              {/* Quick Task Selection */}
              {!selectedTaskId && todayTasks && todayTasks.length > 0 && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Select a task to work on:
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {todayTasks
                      .filter(t => !t.isCompleted)
                      .slice(0, 5)
                      .map(task => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id!)}
                          className="w-full text-left p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {task.completedPomodoros} / {task.estimatedPomodoros} pomodoros
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <TaskList
            tasks={todayTasks}
            onTaskComplete={handleTaskToggle}
            onTaskDelete={deleteTask}
            onTaskUpdate={updateTask}
            onTaskSelect={setSelectedTaskId}
            selectedTaskId={selectedTaskId}
          />
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard />}

        {activeTab === 'settings' && <SettingsPanel />}
        </div>
      </main>
    </div>
  );
}

export default App;
