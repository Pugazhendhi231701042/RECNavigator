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
    <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar select-none">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 active:scale-95 border ${
          selectedCategory === 'all'
            ? 'bg-[#6A1B9A] text-white border-purple-300 shadow-md ring-2 ring-purple-200'
            : 'bg-white text-[#6A1B9A] border-purple-200 hover:bg-purple-50'
        }`}
      >
        All Places
      </button>

      {CATEGORIES.map(cat => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shrink-0 active:scale-95 flex items-center gap-1.5 border ${
              isSelected
                ? 'bg-[#6A1B9A] text-white border-purple-300 shadow-md ring-2 ring-purple-200'
                : 'bg-white text-slate-700 border-purple-100 hover:bg-purple-50 hover:text-[#6A1B9A]'
            }`}
          >
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
};
