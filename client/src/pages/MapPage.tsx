import React, { useState, useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, CategoryId, RouteResult } from '../types';
import { CampusScene } from '../components/3d/CampusScene';
import { MapControls } from '../components/navigation/MapControls';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { LocationCard } from '../components/LocationCard/LocationCard';
import { DirectionsPanel } from '../components/DirectionsPanel/DirectionsPanel';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { calculateDijkstraRoute } from '../utils/routing/dijkstra';
import { PATH_NODES, PATH_EDGES } from '../data/recCampusData';

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
  activeTab,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [showDirections, setShowDirections] = useState<boolean>(activeTab === 'directions');
  const [showLabels, setShowLabels] = useState<boolean>(true);
  const [showRoads, setShowRoads] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(1.3);

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
  };

  const handleClearDirections = () => {
    setStartLocation(null);
    setDestinationLocation(null);
    setShowDirections(false);
  };

  const handleResetCameraView = () => {
    onSelectLocation(null);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-65px)] flex overflow-hidden bg-slate-900">
      {/* LEFT SIDEBAR (Desktop >= 1024px) */}
      <div className="hidden lg:flex flex-col w-96 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/80 z-20 shadow-2xl overflow-y-auto text-white">
        <div className="p-4 space-y-4">
          {/* Category Filter Pills */}
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 px-1">
              Filter Categories
            </h4>
            <CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </div>

          {/* Location Details Card OR Directions Panel */}
          {showDirections || activeTab === 'directions' || (startLocation && destinationLocation) ? (
            <DirectionsPanel
              locations={locations}
              startLocation={startLocation}
              destinationLocation={destinationLocation}
              onSelectStart={setStartLocation}
              onSelectDestination={setDestinationLocation}
              onSwapLocations={handleSwap}
              onClearDirections={handleClearDirections}
              activeRoute={activeRoute}
            />
          ) : selectedLocation ? (
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
          ) : (
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/80 text-center">
              <p className="text-sm font-bold text-white">Interactive 3D REC Campus</p>
              <p className="text-xs text-slate-400 mt-1">
                Explore the 3D campus map texture under clear blue skies. Use toolbar buttons to adjust brightness, toggle 3D roads, rotate buildings, and calculate walking routes!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FLOATING SEARCH & CATEGORY BAR (< 1024px) */}
      <div className="lg:hidden absolute top-3 left-3 right-3 z-30 space-y-2 pointer-events-auto">
        <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
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

        {/* 3D Map Floating Control Overlay */}
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
