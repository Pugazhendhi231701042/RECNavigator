import React from 'react';
import type { CategoryId } from '../../types';
import { CATEGORIES } from '../../data/recCampusData';

interface CategoryFilterProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (category: CategoryId | 'all') => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar select-none text-xs">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1 rounded-lg font-bold transition-all shrink-0 active:scale-95 cursor-pointer border ${
          selectedCategory === 'all'
            ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
        }`}
      >
        All
      </button>

      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 cursor-pointer border ${
              isSelected
                ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
