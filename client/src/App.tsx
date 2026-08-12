import { useState } from 'react';
import type { Location } from './types';
import { LOCATIONS as INITIAL_LOCATIONS } from './data/recCampusData';
import { Header } from './components/Header/Header';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import { BottomSheet } from './components/BottomSheet/BottomSheet';
import { LocationCard } from './components/LocationCard/LocationCard';
import { DirectionsPanel } from './components/DirectionsPanel/DirectionsPanel';
import { MapPage } from './pages/MapPage';
import { PlacesPage } from './pages/PlacesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { calculateDijkstraRoute } from './utils/routing/dijkstra';
import { PATH_NODES, PATH_EDGES } from './data/recCampusData';

export function App() {
  // Application State
  const [locations, setLocations] = useState<Location[]>(INITIAL_LOCATIONS);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'directions' | 'places' | 'about' | 'admin'>('map');
  
  // Mobile Bottom Sheet State
  const [mobileSheetMode, setMobileSheetMode] = useState<'none' | 'location' | 'directions'>('none');

  // Handle Location Selection
  const handleSelectLocation = (loc: Location | null) => {
    setSelectedLocation(loc);
    if (loc) {
      setMobileSheetMode('location');
    } else {
      setMobileSheetMode('none');
    }
  };

  // Geolocation Simulation / Detector
  const handleLocateUser = () => {
    const mainGate = locations.find(l => l.id === 'main-gate');
    if (mainGate) setSelectedLocation(mainGate);
  };

  // Admin Handlers
  const handleAddLocation = (newLoc: Location) => {
    setLocations(prev => [...prev, newLoc]);
  };

  const handleUpdateLocation = (updatedLoc: Location) => {
    setLocations(prev => prev.map(l => l.id === updatedLoc.id ? updatedLoc : l));
  };

  const handleDeleteLocation = (id: string) => {
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  const activeRoute = (startLocation && destinationLocation)
    ? calculateDijkstraRoute(startLocation.nodeId, destinationLocation.nodeId, PATH_NODES, PATH_EDGES)
    : null;

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col antialiased selection:bg-rec-blue selection:text-white">
      {/* Top Main Navigation Header */}
      <Header
        locations={locations}
        onSelectLocation={(loc) => {
          handleSelectLocation(loc);
          setActiveTab('map');
        }}
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'directions') setMobileSheetMode('directions');
        }}
        onLocateUser={handleLocateUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative">
        {activeTab === 'map' && (
          <MapPage
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            startLocation={startLocation}
            setStartLocation={(loc) => {
              setStartLocation(loc);
              if (loc && destinationLocation) setMobileSheetMode('directions');
            }}
            destinationLocation={destinationLocation}
            setDestinationLocation={(loc) => {
              setDestinationLocation(loc);
              if (startLocation && loc) setMobileSheetMode('directions');
            }}
            activeTab={activeTab}
          />
        )}

        {activeTab === 'directions' && (
          <div className="max-w-xl mx-auto p-4 pt-6">
            <DirectionsPanel
              locations={locations}
              startLocation={startLocation}
              destinationLocation={destinationLocation}
              onSelectStart={setStartLocation}
              onSelectDestination={setDestinationLocation}
              onSwapLocations={() => {
                const temp = startLocation;
                setStartLocation(destinationLocation);
                setDestinationLocation(temp);
              }}
              onClearDirections={() => {
                setStartLocation(null);
                setDestinationLocation(null);
              }}
              activeRoute={activeRoute}
            />
          </div>
        )}

        {activeTab === 'places' && (
          <PlacesPage
            locations={locations}
            onSelectLocation={(loc) => {
              handleSelectLocation(loc);
              setActiveTab('map');
            }}
            onNavigateToMap={() => setActiveTab('map')}
            onSetAsDestination={(loc) => {
              setDestinationLocation(loc);
              setActiveTab('map');
              setMobileSheetMode('directions');
            }}
          />
        )}

        {activeTab === 'about' && <AboutPage />}

        {activeTab === 'admin' && (
          <AdminPage
            locations={locations}
            onAddLocation={handleAddLocation}
            onUpdateLocation={handleUpdateLocation}
            onDeleteLocation={handleDeleteLocation}
          />
        )}
      </main>

      {/* Mobile Bottom Sheet (< 1024px) */}
      <BottomSheet
        isOpen={mobileSheetMode !== 'none'}
        onClose={() => setMobileSheetMode('none')}
      >
        {mobileSheetMode === 'location' && selectedLocation && (
          <LocationCard
            location={selectedLocation}
            onClose={() => setMobileSheetMode('none')}
            onSetAsStart={(loc) => {
              setStartLocation(loc);
              setMobileSheetMode('directions');
            }}
            onSetAsDestination={(loc) => {
              setDestinationLocation(loc);
              setMobileSheetMode('directions');
            }}
          />
        )}

        {mobileSheetMode === 'directions' && (
          <DirectionsPanel
            locations={locations}
            startLocation={startLocation}
            destinationLocation={destinationLocation}
            onSelectStart={setStartLocation}
            onSelectDestination={setDestinationLocation}
            onSwapLocations={() => {
              const temp = startLocation;
              setStartLocation(destinationLocation);
              setDestinationLocation(temp);
            }}
            onClearDirections={() => {
              setStartLocation(null);
              setDestinationLocation(null);
              setMobileSheetMode('none');
            }}
            activeRoute={activeRoute}
          />
        )}
      </BottomSheet>

      {/* Mobile Bottom Navigation Bar */}
      <NavigationBar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'directions') setMobileSheetMode('directions');
        }}
      />
    </div>
  );
}
export default App;
