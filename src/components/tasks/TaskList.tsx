import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Task } from '../../lib/database';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

interface TaskListProps {
  tasks: Task[] | undefined;
  onTaskComplete: (id: number) => void;
  onTaskDelete: (id: number) => void;
  onTaskUpdate: (id: number, updates: Partial<Task>) => void;
  onTaskSelect?: (id: number) => void;
  selectedTaskId?: number | null;
}

type FilterType = 'all' | 'active' | 'completed';

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskComplete,
  onTaskDelete,
  onTaskUpdate,
  onTaskSelect,
  selectedTaskId
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTasks = tasks?.filter(task => {
    // Apply search filter
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply status filter
    const matchesFilter =
      filter === 'all' ||
      (filter === 'active' && !task.isCompleted) ||
      (filter === 'completed' && task.isCompleted);

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">Tasks</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg sm:rounded-xl shadow-lg transition-all transform hover:scale-105 text-sm sm:text-base"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all text-sm sm:text-base"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {(['all', 'active', 'completed'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 rounded-lg sm:rounded-xl capitalize font-medium transition-all text-sm sm:text-base ${
                filter === f
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {filteredTasks && filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isSelected={selectedTaskId === task.id}
              onComplete={() => onTaskComplete(task.id!)}
              onDelete={() => onTaskDelete(task.id!)}
              onUpdate={(updates) => onTaskUpdate(task.id!, updates)}
              onSelect={onTaskSelect ? () => onTaskSelect(task.id!) : undefined}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            {searchQuery ? 'No tasks match your search' : 'No tasks yet. Create one to get started!'}
          </div>
        )}
      </div>

      {/* Task Form Modal */}
      {isFormOpen && (
        <TaskForm
          onClose={() => setIsFormOpen(false)}
        />
      )}
    </div>
  );
};
