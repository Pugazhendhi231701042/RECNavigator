import React, { useState, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, CategoryId, RouteResult } from '../types';
import { CampusScene } from '../components/3d/CampusScene';
import { MapControls } from '../components/navigation/MapControls';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { LocationCard } from '../components/LocationCard/LocationCard';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { calculateDijkstraRoute } from '../utils/routing/dijkstra';
import { PATH_NODES, PATH_EDGES } from '../data/recCampusData';
import { Navigation, ArrowUpDown, X, Play, ChevronRight, Flag } from 'lucide-react';

interface MapPageProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location | null) => void;
  startLocation: Location | null;
  setStartLocation: (loc: Location | null) => void;
  destinationLocation: Location | null;
  setDestinationLocation: (loc: Location | null) => void;
  activeTab: string;
}

export const MapPage: React.FC<MapPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  startLocation,
  setStartLocation,
  destinationLocation,
  setDestinationLocation,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [showLabels, setShowLabels] = useState<boolean>(false); // Initially OFF
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(1.3);

  // Navigation Step State
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Filter Locations by Category
  const filteredLocations = selectedCategory === 'all'
    ? locations
    : locations.filter(l => l.category === selectedCategory);

  // Compute Active 3D Dijkstra Route
  let activeRoute: RouteResult | null = null;
  if (startLocation && destinationLocation) {
    activeRoute = calculateDijkstraRoute(
      startLocation.nodeId,
      destinationLocation.nodeId,
      PATH_NODES,
      PATH_EDGES
    );
  }

  const handleSwap = () => {
    const temp = startLocation;
    setStartLocation(destinationLocation);
    setDestinationLocation(temp);
    setIsNavigating(false);
    setCurrentStepIndex(0);
  };

  const handleClearDirections = () => {
    setStartLocation(null);
    setDestinationLocation(null);
    setShowDirections(false);
    setIsNavigating(false);
    setCurrentStepIndex(0);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (activeRoute && currentStepIndex < activeRoute.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleResetCameraView = () => {
    onSelectLocation(null);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const isDestinationReached = activeRoute && currentStepIndex === activeRoute.steps.length - 1;

  return (
    <div className="relative w-full h-[calc(100vh-65px)] flex overflow-hidden bg-slate-950">
      {/* LEFT SIDEBAR (Desktop >= 1024px) with Ultra Premium Glassmorphism */}
      <div className="hidden lg:flex flex-col w-[380px] bg-slate-900/80 backdrop-blur-2xl border-r border-slate-800/80 z-20 shadow-2xl overflow-y-auto text-white">
        <div className="p-4 space-y-4">
          
          {/* 1. DIRECTIONS BUTTON (POSITIONED ABOVE FILTER CATEGORIES) */}
          <div className="space-y-3">
            <button
              onClick={() => setShowDirections(prev => !prev)}
              className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-between transition-all shadow-lg active:scale-98 border ${
                showDirections || (startLocation && destinationLocation)
                  ? 'bg-gradient-to-r from-rec-blue via-blue-600 to-indigo-700 text-white border-blue-400/40 ring-1 ring-white/20'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Navigation className="w-4 h-4 text-amber-400" />
                <span>Directions {startLocation && destinationLocation ? '(Active Route)' : ''}</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-white/10 px-2 py-0.5 rounded-full text-amber-300">
                {showDirections ? 'Close' : 'Open'}
              </span>
            </button>

            {/* 2. DIRECTIONS FROM [] - TO [] PANEL & STEP NAVIGATION */}
            {showDirections && (
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                    Find Shortest Walking Route
                  </span>
                  <button onClick={handleClearDirections} className="text-slate-400 hover:text-white text-xs">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* From Location Picker */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    From (Starting Point)
                  </label>
                  <select
                    value={startLocation?.id || ''}
                    onChange={(e) => {
                      const loc = locations.find(l => l.id === e.target.value) || null;
                      setStartLocation(loc);
                      setIsNavigating(false);
                    }}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rec-blue"
                  >
                    <option value="">-- Select Starting Point --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>📍 {loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center -my-1">
                  <button
                    onClick={handleSwap}
                    title="Swap Start and Destination"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-full shadow-md transition-transform hover:rotate-180 duration-300"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* To Location Picker */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                    To (Destination)
                  </label>
                  <select
                    value={destinationLocation?.id || ''}
                    onChange={(e) => {
                      const loc = locations.find(l => l.id === e.target.value) || null;
                      setDestinationLocation(loc);
                      setIsNavigating(false);
                    }}
                    className="w-full py-2 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rec-blue"
                  >
                    <option value="">-- Select Destination --</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>🏁 {loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Route Summary & Navigation Actions */}
                {activeRoute && (
                  <div className="pt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Distance</p>
                        <p className="text-sm font-black text-amber-400">{activeRoute.distance} m</p>
                      </div>
                      <div className="bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Walk Time</p>
                        <p className="text-sm font-black text-emerald-400">{activeRoute.walkingTime} min</p>
                      </div>
                    </div>

                    {!isNavigating ? (
                      <button
                        onClick={handleStartNavigation}
                        className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 active:scale-98"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        Start Navigation
                      </button>
                    ) : (
                      <div className="space-y-2">
                        {/* ACTIVE STEP CARD */}
                        <div className="p-3 bg-slate-800 rounded-xl border border-emerald-500/50 space-y-2 shadow-lg">
                          <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400">
                            <span>Step {currentStepIndex + 1} of {activeRoute.steps.length}</span>
                            <span>{activeRoute.steps[currentStepIndex].distance}m</span>
                          </div>

                          <p className="text-xs font-extrabold text-white leading-snug">
                            {activeRoute.steps[currentStepIndex].instruction}
                          </p>

                          {/* DESTINATION REACHED NOTIFICATION OR NEXT STEP BUTTON */}
                          {isDestinationReached ? (
                            <div className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg text-center space-y-1 animate-in zoom-in-95">
                              <p className="text-xs font-black text-white flex items-center justify-center gap-1.5">
                                <Flag className="w-4 h-4 text-amber-300" />
                                Destination Reached! 🏁
                              </p>
                              <button
                                onClick={handleClearDirections}
                                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold rounded-md transition-colors"
                              >
                                Finish Navigation
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleNextStep}
                              className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98"
                            >
                              <span>Next Step</span>
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 3. FILTER CATEGORIES */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Filter Categories
            </h4>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* 4. SELECTED LOCATION CARD DETAILS */}
          {selectedLocation && !showDirections && (
            <LocationCard
              location={selectedLocation}
              onClose={() => onSelectLocation(null)}
              onSetAsStart={(loc) => {
                setStartLocation(loc);
                setShowDirections(true);
              }}
              onSetAsDestination={(loc) => {
                setDestinationLocation(loc);
                setShowDirections(true);
              }}
            />
          )}

          {!selectedLocation && !showDirections && (
            <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60 text-center space-y-2">
              <p className="text-xs font-extrabold text-white">Interactive 3D REC Campus</p>
              <p className="text-[11px] text-slate-400">
                Click any 3D building model to inspect facilities, or click <strong className="text-amber-400">Directions</strong> above to find shortest walking paths!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FLOATING SEARCH & CATEGORY BAR (< 1024px) */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-30 space-y-2 pointer-events-auto">
        <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        <button
          onClick={() => setShowDirections(prev => !prev)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-rec-blue to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg flex items-center justify-between"
        >
          <span className="flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-amber-400" />
            Directions From - To
          </span>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">{showDirections ? 'Close' : 'Open'}</span>
        </button>

        {showDirections && (
          <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl space-y-2 shadow-2xl text-white text-xs">
            <select
              value={startLocation?.id || ''}
              onChange={(e) => setStartLocation(locations.find(l => l.id === e.target.value) || null)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs"
            >
              <option value="">-- From (Start) --</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select
              value={destinationLocation?.id || ''}
              onChange={(e) => setDestinationLocation(locations.find(l => l.id === e.target.value) || null)}
              className="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg text-xs"
            >
              <option value="">-- To (Destination) --</option>
              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>

            {activeRoute && !isNavigating && (
              <button
                onClick={handleStartNavigation}
                className="w-full py-2 bg-emerald-500 text-white font-bold rounded-lg text-xs"
              >
                Start Navigation
              </button>
            )}

            {isNavigating && activeRoute && (
              <div className="p-2 bg-slate-800 border border-emerald-500 rounded-lg space-y-1">
                <p className="font-bold text-emerald-400">Step {currentStepIndex + 1}: {activeRoute.steps[currentStepIndex].instruction}</p>
                {isDestinationReached ? (
                  <p className="text-amber-400 font-bold">Destination Reached! 🏁</p>
                ) : (
                  <button onClick={handleNextStep} className="w-full py-1 bg-emerald-500 text-white font-bold rounded">Next Step</button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN 3D WEBGL CAMPUS CANVAS */}
      <div className="flex-1 h-full relative">
        <CampusScene
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
          activeRoute={activeRoute}
          startLocation={startLocation}
          destinationLocation={destinationLocation}
          showLabels={showLabels}
          showRoads={showRoads}
          brightness={brightness}
          controlsRef={controlsRef}
        />

        {/* Collapsable 3D Floating Control Toolbar */}
        <MapControls
          showLabels={showLabels}
          onToggleLabels={() => setShowLabels(prev => !prev)}
          showRoads={showRoads}
          onToggleRoads={() => setShowRoads(prev => !prev)}
          brightness={brightness}
          onChangeBrightness={setBrightness}
          onResetCamera={handleResetCameraView}
          controlsRef={controlsRef}
        />
      </div>
    </div>
  );
};
