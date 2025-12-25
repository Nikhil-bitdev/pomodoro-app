import React, { useState } from 'react';
import { Check, Trash2, Edit2, Clock, Tag } from 'lucide-react';
import { Task } from '../../lib/database';

interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  onComplete: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
  onSelect?: () => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isSelected,
  onComplete,
  onDelete,
  onUpdate,
  onSelect
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');

  const handleSave = () => {
    onUpdate({
      title: editTitle,
      description: editDescription
    });
    setIsEditing(false);
  };

  const progress = task.estimatedPomodoros > 0
    ? (task.completedPomodoros / task.estimatedPomodoros) * 100
    : 0;

  return (
    <div
      className={`group relative p-4 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.01] ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/30 dark:via-indigo-900/30 dark:to-purple-900/30 shadow-xl shadow-blue-500/30 scale-[1.02]'
          : task.isCompleted
          ? 'border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 opacity-75'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-2xl'
      } ${onSelect ? 'cursor-pointer' : ''}`}
      onClick={onSelect && !isEditing ? onSelect : undefined}
    >
      {isEditing ? (
        /* Edit Mode */
        <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Task title"
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Description (optional)"
            rows={2}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* View Mode */
        <div className="flex items-start gap-2 sm:gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-md transform hover:scale-110 ${
              task.isCompleted
                ? 'bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 border-green-400 shadow-lg shadow-green-500/50 scale-105 rotate-0'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 hover:shadow-xl hover:shadow-green-500/30'
            }`}
          >
            {task.isCompleted && <Check size={18} className="text-white animate-in zoom-in duration-300" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`text-sm sm:text-base font-semibold tracking-tight transition-all ${
                    task.isCompleted
                      ? 'line-through text-gray-500 dark:text-gray-400 opacity-60'
                      : 'text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400'
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1.5 ml-2 opacity-0 sm:opacity-0 group-hover:opacity-100 transition-all duration-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all transform hover:scale-110"
                  aria-label="Edit task"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all transform hover:scale-110"
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Pomodoros Progress */}
            <div className="flex items-center gap-2.5 mt-3.5">
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30">
                <Clock size={14} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 h-3 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-500 via-pink-500 to-rose-600 transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {task.tags.map((tag, index) => {
                  const colors = [
                    'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
                    'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
                    'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800',
                    'bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
                  ];
                  return (
                    <span
                      key={tag}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full shadow-sm ${colors[index % colors.length]}`}
                    >
                      <Tag size={10} />
                      {tag}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
