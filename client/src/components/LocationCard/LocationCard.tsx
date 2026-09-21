import React from 'react';
import type { Location } from '../../types';
import { CATEGORIES } from '../../data/recCampusData';
import { Navigation, X, CheckCircle2, MapPin } from 'lucide-react';

interface LocationCardProps {
  location: Location;
  onClose: () => void;
  onSetAsStart: (loc: Location) => void;
  onSetAsDestination: (loc: Location) => void;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onClose,
  onSetAsStart,
  onSetAsDestination,
}) => {
  const categoryObj = CATEGORIES.find(c => c.id === location.category);

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 dark:border-slate-800/80 overflow-hidden flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Image Header with Gradient Overlay */}
      <div className="relative h-44 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <img
          src={location.image || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />
        
        {/* Category Pill */}
        <span
          style={{ backgroundColor: categoryObj?.color || '#6A1B9A' }}
          className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-md"
        >
          {categoryObj?.name || location.category}
        </span>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-slate-900/70 hover:bg-slate-900 text-white rounded-xl backdrop-blur-md transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Building Name on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-base sm:text-lg font-black tracking-tight drop-shadow-md leading-snug">
            {location.name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3 text-slate-900 dark:text-white">
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {location.description || 'Verified Rajalakshmi Engineering College campus building.'}
        </p>

        {/* Coordinates Badges */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Coordinates: ({location.position.x}m, {location.position.z}m)</span>
        </div>

        {/* Facilities List */}
        {location.facilities && location.facilities.length > 0 && (
          <div className="space-y-1 pt-1">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Key Facilities</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {location.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-semibold bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-lg">
                  <CheckCircle2 className="w-3 h-3 text-amber-500 shrink-0" />
                  <span className="line-clamp-1 text-[11px]">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="p-3 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 flex items-center gap-2">
        <button
          onClick={() => onSetAsStart(location)}
          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-500 rotate-45" />
          <span>From Here</span>
        </button>
        <button
          onClick={() => onSetAsDestination(location)}
          className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition-all cursor-pointer active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-300" />
          <span>To Here</span>
        </button>
      </div>
    </div>
  );
};
