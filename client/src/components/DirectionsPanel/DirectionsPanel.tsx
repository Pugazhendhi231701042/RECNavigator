import React, { useState } from 'react';
import type { Location, RouteResult } from '../../types';
import { Navigation, ArrowUpDown, Clock, Footprints, X, Compass, Play, Square, Volume2, CheckCircle2 } from 'lucide-react';

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
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setActiveStepIndex(0);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setActiveStepIndex(0);
  };

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 p-5 flex flex-col max-h-[85vh] w-full animate-in fade-in slide-in-from-left-4 duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-rec-blue/10 text-rec-blue flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 leading-none">Campus Navigation</h3>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">REC Shortest Walking Route</p>
          </div>
        </div>
        <button
          onClick={() => {
            handleStopNavigation();
            onClearDirections();
          }}
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
              handleStopNavigation();
            }}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rec-blue transition-all"
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
            onClick={() => {
              onSwapLocations();
              handleStopNavigation();
            }}
            title="Swap Start and Destination"
            className="p-2 bg-white border border-slate-200 hover:border-rec-blue text-slate-600 hover:text-rec-blue rounded-full shadow-md transition-all hover:rotate-180 duration-300 z-10"
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
              handleStopNavigation();
            }}
            className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rec-blue transition-all"
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
            <div className="bg-blue-50/80 border border-blue-100 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Footprints className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-blue-600 tracking-wider">Distance</p>
                <p className="text-lg font-black text-slate-900">{activeRoute.distance} m</p>
              </div>
            </div>

            <div className="bg-amber-50/80 border border-amber-100 p-3 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-amber-700 tracking-wider">Walk Time</p>
                <p className="text-lg font-black text-slate-900">{activeRoute.walkingTime} min</p>
              </div>
            </div>
          </div>

          {/* START NAVIGATION BUTTON */}
          {!isNavigating ? (
            <button
              onClick={handleStartNavigation}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all transform active:scale-98 flex items-center justify-center gap-2 group"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              Start 3D Navigation
            </button>
          ) : (
            <div className="space-y-2">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl flex items-center justify-between shadow-md animate-pulse">
                <div className="flex items-center gap-2.5 text-emerald-800 font-extrabold text-xs">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>Navigation Active (Step {activeStepIndex + 1} of {activeRoute.steps.length})</span>
                </div>
                <button
                  onClick={handleStopNavigation}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow-sm transition-colors"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop
                </button>
              </div>
            </div>
          )}

          {/* Turn-by-Turn Steps Header */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-rec-blue" />
              Turn-by-Turn Route Guidance
            </h4>
            
            <div className="space-y-3 border-l-2 border-slate-200 ml-3 pl-4">
              {activeRoute.steps.map((step, idx) => {
                const isActive = isNavigating && activeStepIndex === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isNavigating) setActiveStepIndex(idx);
                    }}
                    className={`relative p-2.5 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-50 border border-emerald-300 shadow-md translate-x-1'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Step Indicator Dot */}
                    <div
                      className={`absolute -left-[23px] top-3.5 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${
                        isActive ? 'bg-emerald-500 scale-125' : 'bg-rec-blue'
                      }`}
                    >
                      {isActive && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                    </div>

                    <p className={`text-xs font-bold leading-snug ${isActive ? 'text-emerald-900' : 'text-slate-800'}`}>
                      {step.instruction}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-medium">
                      {step.distance} meters
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6 p-6 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200 text-center space-y-2">
          <Compass className="w-8 h-8 text-rec-blue/40 mx-auto animate-spin-slow" />
          <p className="text-sm font-bold text-slate-800">Ready to Navigate</p>
          <p className="text-xs text-slate-500">
            Select starting location and destination to compute shortest campus walking route.
          </p>
        </div>
      )}
    </div>
  );
};
