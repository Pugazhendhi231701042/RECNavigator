import React from 'react';
import type { Location, RouteResult } from '../../types';
import { Navigation, ArrowUpDown, Clock, Footprints, X, Compass } from 'lucide-react';

interface DirectionsPanelProps {
  locations: Location[];
  startLocation: Location | null;
  destinationLocation: Location | null;
  onSelectStart: (loc: Location | null) => void;
  onSelectDestination: (loc: Location | null) => void;
  onSwapLocations: () => void;
  onClearDirections: () => void;
  activeRoute: RouteResult | null;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  locations,
  startLocation,
  destinationLocation,
  onSelectStart,
  onSelectDestination,
  onSwapLocations,
  onClearDirections,
  activeRoute,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 flex flex-col max-h-[85vh] w-full animate-in fade-in slide-in-from-left-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-rec-blue/10 text-rec-blue flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Campus Directions</h3>
        </div>
        <button
          onClick={onClearDirections}
          className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* From / To Pickers Container */}
      <div className="mt-4 space-y-3 relative">
        {/* From Picker */}
        <div className="relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Starting Point
          </label>
          <select
            value={startLocation?.id || ''}
            onChange={(e) => {
              const loc = locations.find(l => l.id === e.target.value) || null;
              onSelectStart(loc);
            }}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rec-blue"
          >
            <option value="">-- Select Starting Location --</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                📍 {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            onClick={onSwapLocations}
            title="Swap Start and Destination"
            className="p-2 bg-white border border-slate-200 hover:border-rec-blue text-slate-600 hover:text-rec-blue rounded-full shadow-sm transition-all hover:rotate-180 duration-300 z-10"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* To Picker */}
        <div className="relative">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Destination
          </label>
          <select
            value={destinationLocation?.id || ''}
            onChange={(e) => {
              const loc = locations.find(l => l.id === e.target.value) || null;
              onSelectDestination(loc);
            }}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rec-blue"
          >
            <option value="">-- Select Destination --</option>
            {locations.map(loc => (
              <option key={loc.id} value={loc.id}>
                🏁 {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ROUTE STATS & STEP-BY-STEP RESULTS */}
      {activeRoute ? (
        <div className="mt-5 overflow-y-auto flex-1 space-y-4 pr-1">
          {/* Route Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Distance</p>
                <p className="text-lg font-extrabold text-slate-900">{activeRoute.distance} m</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Walk Time</p>
                <p className="text-lg font-extrabold text-slate-900">{activeRoute.walkingTime} min</p>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Steps Header */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              Turn-by-Turn Route
            </h4>
            
            <div className="space-y-3 border-l-2 border-slate-200 ml-3 pl-4">
              {activeRoute.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Dot */}
                  <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-rec-blue border-2 border-white shadow-sm" />
                  <p className="text-xs font-semibold text-slate-800 leading-snug">
                    {step.instruction}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                    {step.distance} meters
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center">
          <Compass className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-spin-slow" />
          <p className="text-sm font-semibold text-slate-700">Ready to Navigate</p>
          <p className="text-xs text-slate-400 mt-1">
            Select a starting point and destination to compute the shortest campus route.
          </p>
        </div>
      )}
    </div>
  );
};
