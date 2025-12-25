import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { Calendar, TrendingUp, Clock, Target } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { getSummary, getChartData } = useAnalytics();
  const [period, setPeriod] = useState<7 | 30 | 90>(7);
  const [summary, setSummary] = useState({
    totalPomodoros: 0,
    totalMinutes: 0,
    totalTasks: 0,
    currentStreak: 0,
    longestStreak: 0,
    completionRate: 0
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const summaryData = await getSummary(period);
      setSummary(summaryData);

      const chart = await getChartData(period);
      setChartData(chart);
    };

    loadData();
  }, [period, getSummary, getChartData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Analytics</h2>
        
        {/* Period Selector */}
        <div className="flex gap-2">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setPeriod(days as 7 | 30 | 90)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                period === days
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Pomodoros */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 backdrop-blur-xl rounded-2xl shadow-xl border border-red-100 dark:border-red-800 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Total Pomodoros</p>
              <p className="text-4xl font-bold text-red-700 dark:text-red-300 mt-2">
                {summary.totalPomodoros}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Total Minutes */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-xl rounded-2xl shadow-xl border border-blue-100 dark:border-blue-800 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Focus Time</p>
              <p className="text-4xl font-bold text-blue-700 dark:text-blue-300 mt-2">
                {Math.round(summary.totalMinutes / 60)}h
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-xl rounded-2xl shadow-xl border border-green-100 dark:border-green-800 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Current Streak</p>
              <p className="text-4xl font-bold text-green-700 dark:text-green-300 mt-2">
                {summary.currentStreak}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TrendingUp className="text-white" size={28} />
            </div>
          </div>
        </div>

        {/* Tasks Completed */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100 dark:border-purple-800 p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Tasks Done</p>
              <p className="text-4xl font-bold text-purple-700 dark:text-purple-300 mt-2">
                {summary.totalTasks}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Daily Activity
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff'
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString();
              }}
            />
            <Bar dataKey="pomodoros" fill="#ef4444" name="Pomodoros" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-all">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Longest Streak</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mt-2">
            {summary.longestStreak} days
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-all">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mt-2">
            {Math.round(summary.completionRate * 100)}%
          </p>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 transform hover:scale-105 transition-all">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Per Day</p>
          <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 mt-2">
            {(summary.totalPomodoros / period).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
};
