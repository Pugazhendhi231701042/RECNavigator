import React, { useState, useRef, useMemo } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, CategoryId, RouteResult, PathNode, PathEdge } from '../types';
import { CATEGORIES } from '../data/recCampusData';
import { CampusScene } from '../components/3d/CampusScene';
import { MapControls } from '../components/navigation/MapControls';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { LocationCard } from '../components/LocationCard/LocationCard';
import { calculateMultiEntranceRoute } from '../utils/routing/dijkstra';
import { PATH_NODES as DEFAULT_NODES, PATH_EDGES as DEFAULT_EDGES } from '../data/recCampusData';
import {
  ArrowUpDown,
  X,
  Play,
  ChevronRight,
  Flag,
  Search,
  Building2,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
  MapPin,
  Route,
  ChevronDown,
} from 'lucide-react';

interface MapPageProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location | null) => void;
  startLocation: Location | null;
  setStartLocation: (loc: Location | null) => void;
  destinationLocation: Location | null;
  setDestinationLocation: (loc: Location | null) => void;
  activeTab?: string;
  nodes?: PathNode[];
  edges?: PathEdge[];
}

export const MapPage: React.FC<MapPageProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  startLocation,
  setStartLocation,
  destinationLocation,
  setDestinationLocation,
  nodes = DEFAULT_NODES,
  edges = DEFAULT_EDGES,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [showDirections, setShowDirections] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isHudOpen, setIsHudOpen] = useState<boolean>(true);
  const [focusLocation, setFocusLocation] = useState<Location | null>(null);

  // Map 3D Layer Controls
  const [showLabels, setShowLabels] = useState<boolean>(false);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(1.3);

  // Turn-by-Turn Navigation Step State
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Filter Locations by Search & Category
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCat = selectedCategory === 'all' || loc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        q === '' ||
        loc.name.toLowerCase().includes(q) ||
        (loc.block && loc.block.toLowerCase().includes(q)) ||
        (loc.description && loc.description.toLowerCase().includes(q)) ||
        loc.tags?.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesQuery;
    });
  }, [locations, selectedCategory, searchQuery]);

  // Compute Active 3D Dijkstra Route (with Smart Multi-Entrance Support)
  const activeRoute: RouteResult | null = useMemo(() => {
    if (startLocation && destinationLocation) {
      return calculateMultiEntranceRoute(startLocation, destinationLocation, nodes, edges);
    }
    return null;
  }, [startLocation, destinationLocation, nodes, edges]);

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
    setIsNavigating(false);
    setCurrentStepIndex(0);
  };

  const handleStartNavigation = () => {
    setIsNavigating(true);
    setCurrentStepIndex(0);
  };

  const handleNextStep = () => {
    if (activeRoute && currentStepIndex < activeRoute.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handleResetCameraView = () => {
    onSelectLocation(null);
    setFocusLocation(null);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleBuildingDoubleClick = (loc: Location) => {
    setFocusLocation(loc);
  };

  const isDestinationReached =
    activeRoute && currentStepIndex === activeRoute.steps.length - 1;

  return (
    <div className="relative w-full h-[calc(100vh-65px)] overflow-hidden bg-slate-100 dark:bg-[#080B11] text-slate-900 dark:text-white select-none">
      {/* 1. BACKGROUND 3D WEBGL CAMPUS CANVAS */}
      <div className="absolute inset-0 z-0">
        <CampusScene
          locations={filteredLocations}
          selectedLocation={selectedLocation}
          onSelectLocation={(loc) => {
            onSelectLocation(loc);
            if (!isHudOpen) setIsHudOpen(true);
          }}
          focusLocation={focusLocation}
          onDoubleClickLocation={handleBuildingDoubleClick}
          activeRoute={activeRoute}
          startLocation={startLocation}
          destinationLocation={destinationLocation}
          showLabels={showLabels}
          showRoads={showRoads}
          brightness={brightness}
          controlsRef={controlsRef}
          nodes={nodes}
          edges={edges}
        />
      </div>

      {/* 2. FLOATING HUD TOGGLE BUTTON (When HUD is collapsed) */}
      {!isHudOpen && (
        <button
          onClick={() => setIsHudOpen(true)}
          className="absolute top-4 left-4 z-20 p-3 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl transition-all cursor-pointer flex items-center gap-2 group"
          title="Expand Campus Directory"
        >
          <PanelLeftOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="text-xs font-black tracking-wider uppercase">Open HUD</span>
        </button>
      )}

      {/* 3. FLOATING CAD STUDIO HUD (Left Side Panel) */}
      {isHudOpen && (
        <aside className="absolute left-3 top-3 bottom-3 w-[370px] max-w-[calc(100vw-24px)] bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl z-20 shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
          {/* HUD Header Bar */}
          <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black tracking-widest text-purple-600 dark:text-purple-400 uppercase font-mono">
                CAD NAVIGATOR
              </span>
            </div>

            {/* Collapse HUD Button */}
            <button
              onClick={() => setIsHudOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Minimize HUD to view full canvas"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Action Bar: Directions Button */}
          <div className="p-3 shrink-0 border-b border-slate-200/60 dark:border-slate-800/60 bg-slate-100/40 dark:bg-slate-900/20">
            <button
              onClick={() => setShowDirections(prev => !prev)}
              className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-black transition-all flex items-center justify-between cursor-pointer border shadow-sm ${
                showDirections
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md ring-2 ring-purple-400/30'
                  : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-600 hover:text-purple-600 dark:hover:text-purple-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Route className={`w-4 h-4 ${showDirections ? 'text-cyan-300' : 'text-purple-600 dark:text-purple-400'}`} />
                <span>Directions</span>
                {activeRoute && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold ml-1">
                    {activeRoute.distance}m
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold">
                <span className={showDirections ? 'text-purple-200' : 'text-slate-400'}>
                  {showDirections ? 'Close Form' : 'Open Form'}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showDirections ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>
          </div>

          {/* Scrollable HUD Content Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
            {/* ---------------- DIRECTIONS FORM (OPENS ON BUTTON CLICK) ---------------- */}
            {showDirections && (
              <div className="space-y-3 pb-3 border-b border-slate-200/80 dark:border-slate-800/80 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-amber-500" />
                      Multi-Entrance Router
                    </span>
                    {(startLocation || destinationLocation) && (
                      <button
                        onClick={handleClearDirections}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  {/* Start Point Picker */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-500" />
                      From (Starting Point)
                    </label>
                    <select
                      value={startLocation?.id || ''}
                      onChange={(e) => {
                        const loc = locations.find((l) => l.id === e.target.value) || null;
                        setStartLocation(loc);
                        setIsNavigating(false);
                      }}
                      className="w-full py-2 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Choose Starting Building --</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          📍 {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center -my-1">
                    <button
                      onClick={handleSwap}
                      title="Swap Start and Destination"
                      className="p-1.5 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-amber-500 rounded-full shadow-md transition-transform hover:rotate-180 duration-300 cursor-pointer"
                    >
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Destination Picker */}
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Flag className="w-3 h-3 text-amber-500" />
                      To (Destination)
                    </label>
                    <select
                      value={destinationLocation?.id || ''}
                      onChange={(e) => {
                        const loc = locations.find((l) => l.id === e.target.value) || null;
                        setDestinationLocation(loc);
                        setIsNavigating(false);
                      }}
                      className="w-full py-2 px-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">-- Choose Destination Building --</option>
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          🏁 {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Telemetry Summary & Step Guidance */}
                {activeRoute && (
                  <div className="space-y-3">
                    {/* Distance & Time Telemetry Cards */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="bg-purple-50/80 dark:bg-purple-950/30 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800/60">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">
                          Walking Distance
                        </p>
                        <p className="text-base font-black text-purple-600 dark:text-purple-300 font-mono">
                          {activeRoute.distance} m
                        </p>
                      </div>
                      <div className="bg-amber-50/80 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black">
                          Est. Walking Time
                        </p>
                        <p className="text-base font-black text-amber-600 dark:text-amber-400 font-mono">
                          {activeRoute.walkingTime} min
                        </p>
                      </div>
                    </div>

                    {!isNavigating ? (
                      <button
                        onClick={handleStartNavigation}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer border border-purple-400/30"
                      >
                        <Play className="w-4 h-4 fill-current text-amber-300" />
                        Start 3D Step Guidance
                      </button>
                    ) : (
                      <div className="space-y-2.5">
                        {/* Active Step Card */}
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-300 dark:border-purple-700 space-y-2 shadow-sm">
                          <div className="flex items-center justify-between text-[10px] font-black text-purple-600 dark:text-purple-300 uppercase font-mono">
                            <span>
                              Step {currentStepIndex + 1} of {activeRoute.steps.length}
                            </span>
                            <span className="text-amber-500 font-mono">
                              {activeRoute.steps[currentStepIndex].distance}m
                            </span>
                          </div>

                          <p className="text-xs font-bold text-slate-900 dark:text-white leading-relaxed">
                            {activeRoute.steps[currentStepIndex].instruction}
                          </p>

                          {isDestinationReached ? (
                            <div className="p-3 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-center space-y-1.5 shadow-md animate-in zoom-in-95 text-white">
                              <p className="text-xs font-black flex items-center justify-center gap-1.5">
                                <Flag className="w-4 h-4 text-amber-200" />
                                Destination Reached! 🏁
                              </p>
                              <button
                                onClick={handleClearDirections}
                                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[10px] font-extrabold rounded-md transition-colors cursor-pointer"
                              >
                                Finish Navigation
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={handleNextStep}
                              className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 active:scale-98 cursor-pointer"
                            >
                              <span>Next Step</span>
                              <ChevronRight className="w-4 h-4 text-amber-300" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!activeRoute && startLocation && destinationLocation && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-600 dark:text-rose-400">
                    No connected road path found between the selected buildings. Check entrance connections in CAD Studio.
                  </div>
                )}
              </div>
            )}

            {/* ---------------- CAMPUS DIRECTORY (ALWAYS VISIBLE BELOW) ---------------- */}
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search campus buildings..."
                  className="w-full py-2 pl-9 pr-8 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Chips */}
              <div>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />
              </div>

              {/* Selected Location Card Inspector */}
              {selectedLocation ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
                      Selected Entity Inspector
                    </span>
                    <button
                      onClick={() => onSelectLocation(null)}
                      className="text-[10px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold"
                    >
                      Back to List
                    </button>
                  </div>
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
                </div>
              ) : (
                /* Filtered Locations List */
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1">
                    <span>{filteredLocations.length} Locations Found</span>
                    <span className="text-[10px] text-amber-500 font-mono">Double-click to zoom</span>
                  </div>

                  <div className="space-y-1.5">
                    {filteredLocations.map((loc) => {
                      const cat = CATEGORIES.find((c) => c.id === loc.category);
                      const isSelected = selectedLocation?.id === loc.id;
                      const entranceCount = loc.entrances?.length || 0;

                      return (
                        <div
                          key={loc.id}
                          onClick={() => onSelectLocation(loc)}
                          onDoubleClick={() => handleBuildingDoubleClick(loc)}
                          className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                            isSelected
                              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 text-purple-900 dark:text-purple-200 shadow-sm ring-1 ring-purple-500/30'
                              : 'bg-white/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              style={{ backgroundColor: cat?.color || '#9333EA' }}
                              className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-bold truncate leading-tight group-hover:text-purple-600 dark:group-hover:text-purple-300">
                                {loc.name}
                              </h4>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">
                                {cat?.name || loc.category} • [{Math.round(loc.position.x)}, {Math.round(loc.position.z)}]
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            {entranceCount > 0 && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {entranceCount} 🚪
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}

                    {filteredLocations.length === 0 && (
                      <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 space-y-2">
                        <Building2 className="w-8 h-8 mx-auto opacity-30 text-purple-400" />
                        <p>No locations match your search or filter.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      )}

      {/* 4. FLOATING MAP CONTROLS TOOLBAR (Right Side) */}
      <MapControls
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels((prev) => !prev)}
        showRoads={showRoads}
        onToggleRoads={() => setShowRoads((prev) => !prev)}
        brightness={brightness}
        onChangeBrightness={setBrightness}
        onResetCamera={handleResetCameraView}
        controlsRef={controlsRef}
      />
    </div>
  );
};
