'use client';

import { useState, useEffect } from 'react';

interface TaskFormData {
  title: string;
  description: string;
  category: 'WORK' | 'PERSONAL' | 'HOME' | 'FINANCIAL' | 'CUSTOM' | string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  deadline: string;
  customCategory?: string;
}

interface TaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  onCancel: () => void;
  initialData?: Partial<TaskFormData>;
}

export default function TaskForm({ onSubmit, onCancel, initialData }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    category: initialData?.category || 'PERSONAL',
    priority: initialData?.priority || 'LOW',
    deadline: initialData?.deadline || '',
    customCategory: '',
  });

  // Handle custom category when editing
  useEffect(() => {
    if (
      initialData?.category &&
      !['WORK', 'PERSONAL', 'HOME', 'FINANCIAL'].includes(initialData.category)
    ) {
      setFormData(prev => ({
        ...prev,
        category: 'CUSTOM',
        customCategory: initialData.category,
      }));
    }
  }, [initialData?.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalData = {
      ...formData,
      category:
        formData.category === 'CUSTOM'
          ? formData.customCategory || 'CUSTOM'
          : formData.category,
    };

    onSubmit(finalData);
  };

  const handleChange = (field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-gray-900 rounded-lg shadow-lg p-3 w-full max-w-md mx-auto border border-gray-800">

      {/* Header */}
      <h2 className="text-sm font-semibold text-white mb-2 flex items-center">
        {initialData ? '✏️ Edit Task' : '➕ Create Task'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-2 text-xs">

        {/* Title */}
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-2 py-1.5 border border-gray-700 rounded bg-black text-white focus:ring-1 focus:ring-green-500 outline-none"
          placeholder="Title"
          required
        />

        {/* Description */}
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          rows={2}
          className="w-full px-2 py-1.5 border border-gray-700 rounded bg-black text-white focus:ring-1 focus:ring-green-500 outline-none"
          placeholder="Description"
        />

        {/* Category + Priority Row */}
        <div className="flex gap-2">

          {/* Category */}
          <select
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            className="flex-1 px-2 py-1.5 border border-gray-700 rounded bg-black text-white outline-none"
          >
            <option value="WORK">Work</option>
            <option value="PERSONAL">Personal</option>
            <option value="HOME">Home</option>
            <option value="FINANCIAL">Financial</option>
            <option value="CUSTOM">Custom</option>
          </select>

          {/* Priority */}
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-24 px-2 py-1.5 border border-gray-700 rounded bg-black text-white outline-none"
          >
            <option value="LOW">Low</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Custom Category Input */}
        {formData.category === 'CUSTOM' && (
          <input
            type="text"
            value={formData.customCategory}
            onChange={(e) => handleChange('customCategory', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-700 rounded bg-black text-white outline-none"
            placeholder="Custom category"
          />
        )}

        {/* Deadline */}
        <div className="relative">
          <input
            ref={(input) => {
              if (input) {
                (input as any).deadlineInput = input;
              }
            }}
            type="datetime-local"
            value={formData.deadline}
            onChange={(e) => handleChange('deadline', e.target.value)}
            className="w-full px-2 py-1.5 border border-gray-700 rounded bg-black text-white outline-none pr-24"
          />
          <div className="absolute right-1 top-1/2 transform -translate-y-1/2">
            <button
              type="button"
              onClick={() => {
                const input = document.querySelector('input[type="datetime-local"]') as HTMLInputElement;
                if (input) {
                  input.focus();
                  input.showPicker?.();
                }
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
            >
              Set Deadline
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-2 py-1 border border-gray-700 rounded text-gray-400 hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            {initialData ? 'Update' : 'Add'}
          </button>
        </div>

      </form>
    </div>
  );
}