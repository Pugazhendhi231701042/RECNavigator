import React from 'react';
import type { Category, CategoryId } from '../../types';
import { CATEGORIES } from '../../data/recCampusData';
import { GraduationCap, Utensils, Home, Trophy, Car, DoorOpen, Building2, Sparkles, Layers } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryId | 'all';
  onSelectCategory: (catId: CategoryId | 'all') => void;
}

const iconMap: Record<string, React.ReactNode> = {
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Utensils: <Utensils className="w-4 h-4" />,
  Home: <Home className="w-4 h-4" />,
  Trophy: <Trophy className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
  DoorOpen: <DoorOpen className="w-4 h-4" />,
  Building2: <Building2 className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
};

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all shadow-sm ${
          selectedCategory === 'all'
            ? 'bg-rec-blue text-white shadow-rec-blue/20'
            : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Layers className="w-3.5 h-3.5" />
        All Places
      </button>

      {CATEGORIES.map((cat: Category) => {
        const isSelected = selectedCategory === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all shadow-sm ${
              isSelected
                ? 'bg-rec-blue text-white shadow-rec-blue/20'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {iconMap[cat.icon] || <Building2 className="w-3.5 h-3.5" />}
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
