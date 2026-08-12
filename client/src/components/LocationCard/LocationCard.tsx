import React from 'react';
import type { Location } from '../../types';
import { CATEGORIES } from '../../data/recCampusData';
import { X, Navigation, MapPin, CheckCircle2, Layers, Compass } from 'lucide-react';

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
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh] w-full animate-in fade-in slide-in-from-bottom-4 duration-200">
      {/* Header Image with Gradient Overlay */}
      <div className="relative h-44 w-full bg-slate-800 shrink-0 overflow-hidden">
        <img
          src={location.image || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
          alt={location.name}
          className="w-full h-full object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-4 flex items-center gap-2">
          <span
            style={{ backgroundColor: categoryObj?.color || '#2563EB' }}
            className="px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider shadow-md"
          >
            {categoryObj?.name || location.category}
          </span>
          {location.block && (
            <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[11px] font-semibold text-white">
              {location.block} ({location.floorCount} Floors)
            </span>
          )}
        </div>
      </div>

      {/* Location Details Section */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 leading-tight">
            {location.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-rec-blue" />
            Rajalakshmi Engineering College Campus
          </p>
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
            {location.description}
          </p>
        )}

        {/* Facilities & Departments List */}
        {location.facilities && location.facilities.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Departments & Facilities
            </h4>
            <div className="grid grid-cols-1 gap-1.5">
              {location.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3 shrink-0">
        <button
          onClick={() => onSetAsStart(location)}
          className="flex-1 py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Compass className="w-4 h-4" />
          Directions From
        </button>
        <button
          onClick={() => onSetAsDestination(location)}
          className="flex-1 py-2.5 px-3 bg-rec-blue hover:bg-rec-blue-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-rec-blue/20 transition-all"
        >
          <Navigation className="w-4 h-4" />
          Directions To
        </button>
      </div>
    </div>
  );
};
