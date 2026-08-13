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
    <div className="bg-white rounded-3xl shadow-2xl border border-purple-100/90 overflow-hidden flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      {/* Image Header with Gradient Overlay */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={location.image || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
          alt={location.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        {/* Category Pill */}
        <span
          style={{ backgroundColor: categoryObj?.color || '#6A1B9A' }}
          className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-md"
        >
          {categoryObj?.name || location.category}
        </span>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-slate-900/60 hover:bg-slate-900 text-white rounded-full backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Building Name on Image */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="text-lg font-black tracking-tight drop-shadow-md leading-snug">
            {location.name}
          </h3>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-3.5 bg-white text-slate-900">
        <p className="text-xs text-[#6A7282] leading-relaxed font-medium">
          {location.description || 'Verified Rajalakshmi Engineering College campus building.'}
        </p>

        {/* Coordinates Badges */}
        <div className="flex items-center gap-2 text-[11px] text-[#6A7282] font-mono bg-[#FAFAFA] p-2.5 rounded-xl border border-purple-100">
          <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
          <span>3D Coordinates: ({location.position.x}m, {location.position.z}m)</span>
        </div>

        {/* Facilities List */}
        {location.facilities && location.facilities.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-[#6A1B9A]">Key Facilities</h4>
            <div className="grid grid-cols-2 gap-1.5">
              {location.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold bg-purple-50/60 p-2 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                  <span className="line-clamp-1">{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Action Buttons */}
      <div className="p-4 bg-[#FAFAFA] border-t border-purple-100 flex items-center gap-2">
        <button
          onClick={() => onSetAsStart(location)}
          className="flex-1 py-2.5 px-3 bg-white hover:bg-purple-50 text-[#6A1B9A] border border-purple-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Navigation className="w-3.5 h-3.5 text-[#D97706] rotate-45" />
          Directions From
        </button>
        <button
          onClick={() => onSetAsDestination(location)}
          className="flex-1 py-2.5 px-3 bg-[#6A1B9A] hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
        >
          <Navigation className="w-3.5 h-3.5 text-amber-300" />
          Directions To
        </button>
      </div>
    </div>
  );
};
