import { useState, useEffect, useMemo, useRef } from 'react';
import type { Location, PathNode, Road } from './types';
import {
  LOCATIONS as INITIAL_LOCATIONS,
  PATH_NODES as INITIAL_NODES,
  INITIAL_ROADS,
  PATH_EDGES,
  deriveEdgesFromRoads,
} from './data/recCampusData';
import { Header } from './components/Header/Header';
import { NavigationBar } from './components/NavigationBar/NavigationBar';
import { BottomSheet } from './components/BottomSheet/BottomSheet';
import { LocationCard } from './components/LocationCard/LocationCard';
import { DirectionsPanel } from './components/DirectionsPanel/DirectionsPanel';
import { MapPage } from './pages/MapPage';
import { PlacesPage } from './pages/PlacesPage';
import { AboutPage } from './pages/AboutPage';
import { AdminPage } from './pages/AdminPage';
import { calculateMultiEntranceRoute } from './utils/routing/dijkstra';
import { ThemeProvider } from './context/ThemeContext';
import defaultCampusData from './data/campusData.json';
import { Loader2 } from 'lucide-react';
import {
  fetchCampusDataFromServer,
  saveCampusDataToServer,
} from './utils/campusDataApi';

const INITIAL_LOCATIONS_SOURCE: Location[] = (defaultCampusData && Array.isArray(defaultCampusData.locations))
  ? (defaultCampusData.locations as unknown as Location[])
  : INITIAL_LOCATIONS;

const INITIAL_NODES_SOURCE: PathNode[] = (defaultCampusData && Array.isArray(defaultCampusData.nodes))
  ? (defaultCampusData.nodes as unknown as PathNode[])
  : INITIAL_NODES;

const INITIAL_ROADS_SOURCE: Road[] = (defaultCampusData && Array.isArray(defaultCampusData.roads))
  ? (defaultCampusData.roads as unknown as Road[])
  : INITIAL_ROADS;

function AppContent() {
  // Check if this browser already has cached campus data
  const hasCachedData = typeof window !== 'undefined' && !!localStorage.getItem('rec_campus_updated_at');

  const [isCloudLoaded, setIsCloudLoaded] = useState<boolean>(() => {
    // If we have cached data in localStorage, we can render immediately without waiting
    return hasCachedData;
  });

  // Application State with LocalStorage and Server/Disk Persistence
  const [locations, setLocations] = useState<Location[]>(() => {
    try {
      const saved = localStorage.getItem('rec_locations');
      return saved !== null ? JSON.parse(saved) : INITIAL_LOCATIONS_SOURCE;
    } catch {
      return INITIAL_LOCATIONS_SOURCE;
    }
  });

  const [nodes, setNodes] = useState<PathNode[]>(() => {
    try {
      const saved = localStorage.getItem('rec_nodes');
      return saved !== null ? JSON.parse(saved) : INITIAL_NODES_SOURCE;
    } catch {
      return INITIAL_NODES_SOURCE;
    }
  });

  const [roads, setRoads] = useState<Road[]>(() => {
    try {
      const saved = localStorage.getItem('rec_roads');
      return saved !== null ? JSON.parse(saved) : INITIAL_ROADS_SOURCE;
    } catch {
      return INITIAL_ROADS_SOURCE;
    }
  });

  // Track user edits so background hydration NEVER triggers auto-save!
  const hasUserEditedRef = useRef(false);

  // Hydrate from Server / Disk data on mount
  useEffect(() => {
    let isMounted = true;
    fetchCampusDataFromServer()
      .then(serverData => {
        if (!isMounted) return;
        if (serverData && Array.isArray(serverData.locations) && Array.isArray(serverData.nodes) && Array.isArray(serverData.roads)) {
          setLocations(serverData.locations);
          setNodes(serverData.nodes);
          setRoads(serverData.roads);
          try {
            localStorage.setItem('rec_locations', JSON.stringify(serverData.locations));
            localStorage.setItem('rec_nodes', JSON.stringify(serverData.nodes));
            localStorage.setItem('rec_roads', JSON.stringify(serverData.roads));
            localStorage.setItem('rec_campus_updated_at', serverData.updatedAt || new Date().toISOString());
          } catch {}
        }
        setIsCloudLoaded(true);
      })
      .catch(() => {
        if (isMounted) setIsCloudLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [destinationLocation, setDestinationLocation] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'places' | 'about' | 'admin'>('map');
  
  // Mobile Bottom Sheet State
  const [mobileSheetMode, setMobileSheetMode] = useState<'none' | 'location' | 'directions'>('none');

  // Debounced auto-sync to localStorage and server/cloud database (ONLY ON EXPLICIT USER ADMIN EDITS)
  useEffect(() => {
    if (!isCloudLoaded || !hasUserEditedRef.current) {
      return;
    }

    try {
      localStorage.setItem('rec_locations', JSON.stringify(locations));
      localStorage.setItem('rec_nodes', JSON.stringify(nodes));
      localStorage.setItem('rec_roads', JSON.stringify(roads));
    } catch {}

    const timer = setTimeout(() => {
      if (hasUserEditedRef.current) {
        hasUserEditedRef.current = false;
        saveCampusDataToServer({ locations, nodes, roads });
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [locations, nodes, roads, isCloudLoaded]);

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

  // Building Admin Handlers
  const handleAddLocation = (newLoc: Location) => {
    hasUserEditedRef.current = true;
    setLocations(prev => [...prev, newLoc]);
  };

  const handleUpdateLocation = (updatedLoc: Location) => {
    hasUserEditedRef.current = true;
    setLocations(prev => prev.map(l => l.id === updatedLoc.id ? updatedLoc : l));
  };

  const handleDeleteLocation = (id: string) => {
    hasUserEditedRef.current = true;
    setLocations(prev => prev.filter(l => l.id !== id));
  };

  // Junction Admin Handlers
  const handleAddNode = (newNode: PathNode) => {
    hasUserEditedRef.current = true;
    setNodes(prev => [...prev, newNode]);
  };

  const handleUpdateNode = (updatedNode: PathNode) => {
    hasUserEditedRef.current = true;
    setNodes(prev => prev.map(n => n.id === updatedNode.id ? updatedNode : n));
  };

  const handleDeleteNode = (id: string) => {
    hasUserEditedRef.current = true;
    setNodes(prev => prev.filter(n => n.id !== id));
    // Remove from road junction sequences
    setRoads(prev => prev.map(r => ({
      ...r,
      junctionIds: r.junctionIds.filter(jid => jid !== id),
    })));
    // Remove from building entrance lists
    setLocations(prev => prev.map(l => {
      const entrances = (l.entranceNodeIds || [l.nodeId]).filter(jid => jid !== id);
      return {
        ...l,
        entranceNodeIds: entrances,
        nodeId: l.nodeId === id ? (entrances[0] || '') : l.nodeId,
      };
    }));
  };

  // Road Admin Handlers
  const handleAddRoad = (newRoad: Road) => {
    hasUserEditedRef.current = true;
    setRoads(prev => [...prev, newRoad]);
  };

  const handleUpdateRoad = (updatedRoad: Road) => {
    hasUserEditedRef.current = true;
    setRoads(prev => prev.map(r => r.id === updatedRoad.id ? updatedRoad : r));
  };

  const handleDeleteRoad = (id: string) => {
    hasUserEditedRef.current = true;
    setRoads(prev => prev.filter(r => r.id !== id));
  };

  // Reset to Factory Campus Defaults
  const handleResetDefaults = () => {
    hasUserEditedRef.current = false;
    setLocations(INITIAL_LOCATIONS);
    setNodes(INITIAL_NODES);
    setRoads(INITIAL_ROADS);
    setSelectedLocation(null);
    setStartLocation(null);
    setDestinationLocation(null);
    saveCampusDataToServer({
      locations: INITIAL_LOCATIONS,
      nodes: INITIAL_NODES,
      roads: INITIAL_ROADS,
    });
  };

  // Reset System: Delete all buildings, roads and junctions
  const handleResetSystem = () => {
    hasUserEditedRef.current = false;
    setLocations([]);
    setNodes([]);
    setRoads([]);
    setSelectedLocation(null);
    setStartLocation(null);
    setDestinationLocation(null);
    saveCampusDataToServer({
      locations: [],
      nodes: [],
      roads: [],
    });
  };

  // Import custom campus dataset
  const handleImportCampusData = (data: { locations: Location[]; nodes: PathNode[]; roads: Road[] }) => {
    hasUserEditedRef.current = false;
    setLocations(data.locations);
    setNodes(data.nodes);
    setRoads(data.roads);
    saveCampusDataToServer(data);
  };

  // Dynamically derive active navigation graph edges from roads & junctions
  const activeEdges = useMemo(() => {
    return deriveEdgesFromRoads(roads, nodes, PATH_EDGES);
  }, [roads, nodes]);

  // Compute live shortest-path route supporting multiple entrances per building
  const activeRoute = useMemo(() => {
    if (startLocation && destinationLocation) {
      return calculateMultiEntranceRoute(startLocation, destinationLocation, nodes, activeEdges);
    }
    return null;
  }, [startLocation, destinationLocation, nodes, activeEdges]);

  // If initial cloud data is still loading for a first-time device/visitor, show a sleek loading screen
  if (!isCloudLoaded) {
    return (
      <div className="fixed inset-0 bg-[#080B11] text-white flex flex-col items-center justify-center z-50 p-6 space-y-5 font-sans select-none">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600/30 to-purple-400/20 border border-purple-500/40 flex items-center justify-center shadow-2xl shadow-purple-500/20 animate-pulse">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
          </div>
        </div>
        <div className="text-center space-y-1.5 max-w-sm">
          <h2 className="text-base font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>REC NAVIGATOR</span>
          </h2>
          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Connecting to shared cloud database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#080B11] text-slate-900 dark:text-slate-100 font-sans flex flex-col antialiased transition-colors">
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
        }}
        onLocateUser={handleLocateUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'map' && (
          <MapPage
            locations={locations}
            selectedLocation={selectedLocation}
            onSelectLocation={handleSelectLocation}
            startLocation={startLocation}
            setStartLocation={(loc) => {
              setStartLocation(loc);
            }}
            destinationLocation={destinationLocation}
            setDestinationLocation={(loc) => {
              setDestinationLocation(loc);
            }}
            activeTab={activeTab}
            nodes={nodes}
            edges={activeEdges}
          />
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
            }}
          />
        )}

        {activeTab === 'about' && (
          <div className="h-[calc(100vh-65px)] overflow-y-auto">
            <AboutPage />
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="h-[calc(100vh-65px)] overflow-hidden">
            <AdminPage
              locations={locations}
              onAddLocation={handleAddLocation}
              onUpdateLocation={handleUpdateLocation}
              onDeleteLocation={handleDeleteLocation}
              nodes={nodes}
              onAddNode={handleAddNode}
              onUpdateNode={handleUpdateNode}
              onDeleteNode={handleDeleteNode}
              roads={roads}
              onAddRoad={handleAddRoad}
              onUpdateRoad={handleUpdateRoad}
              onDeleteRoad={handleDeleteRoad}
              onResetDefaults={handleResetDefaults}
              onResetSystem={handleResetSystem}
              onImportCampusData={handleImportCampusData}
            />
          </div>
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
        }}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
