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
      className={`group p-3 sm:p-5 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 ${
        isSelected
          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 shadow-lg shadow-blue-500/20'
          : task.isCompleted
          ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-xl'
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
            className={`flex-shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 flex items-center justify-center transition-all shadow-sm ${
              task.isCompleted
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-green-500 shadow-green-500/30'
                : 'border-gray-300 dark:border-gray-600 hover:border-green-500 hover:shadow-lg hover:shadow-green-500/20'
            }`}
          >
            {task.isCompleted && <Check size={18} className="text-white" />}
          </button>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3
                  className={`text-sm sm:text-base font-medium ${
                    task.isCompleted
                      ? 'line-through text-gray-500 dark:text-gray-400'
                      : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="p-1 text-gray-500 hover:text-blue-500"
                  aria-label="Edit task"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="p-1 text-gray-500 hover:text-red-500"
                  aria-label="Delete task"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Pomodoros Progress */}
            <div className="flex items-center gap-2 mt-3">
              <Clock size={16} className="text-gray-500" />
              <div className="flex-1 h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-pink-600 transition-all duration-500 shadow-sm"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {task.completedPomodoros}/{task.estimatedPomodoros}
              </span>
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {task.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 rounded"
                  >
                    <Tag size={10} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
