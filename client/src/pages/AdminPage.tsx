import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, CategoryId, PathNode, Road, Vector3D, Entrance, RouteResult } from '../types';
import {
  CATEGORIES,
  PATH_NODES as DEFAULT_NODES,
  INITIAL_ROADS as DEFAULT_ROADS,
  deriveEdgesFromRoads,
  getSegmentKey,
  calculateEuclideanDistance,
  ensureLocationEntrances,
} from '../data/recCampusData';
import { ASSET_MANIFEST } from '../data/assetManifest';
import { CampusScene } from '../components/3d/CampusScene';
import { calculateDijkstraRoute } from '../utils/routing/dijkstra';
import {
  Building,
  Route,
  Milestone,
  Compass,
  Save,
  RotateCcw,
  Plus,
  Trash2,
  Search,
  Copy,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Navigation,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle,
  LogOut,
  Split,
  Ruler,
  Move,
  Crosshair,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const ADMIN_PASSWORD = 'Admin@2711';

interface AdminPageProps {
  locations: Location[];
  onAddLocation: (newLoc: Location) => void;
  onUpdateLocation: (updatedLoc: Location) => void;
  onDeleteLocation: (id: string) => void;
  nodes?: PathNode[];
  onAddNode?: (newNode: PathNode) => void;
  onUpdateNode?: (updatedNode: PathNode) => void;
  onDeleteNode?: (id: string) => void;
  roads?: Road[];
  onAddRoad?: (newRoad: Road) => void;
  onUpdateRoad?: (updatedRoad: Road) => void;
  onDeleteRoad?: (id: string) => void;
  onResetDefaults?: () => void;
  onResetSystem?: () => void;
}

type AdminSection = 'buildings' | 'junctions-roads';
type CameraViewMode = 'perspective' | 'top';
type TransformGizmoMode = 'translate' | 'rotate' | 'scale' | null;

export const AdminPage: React.FC<AdminPageProps> = ({
  locations,
  onAddLocation,
  onUpdateLocation,
  onDeleteLocation,
  nodes = DEFAULT_NODES,
  onAddNode,
  onUpdateNode,
  onDeleteNode,
  roads = DEFAULT_ROADS,
  onAddRoad,
  onUpdateRoad,
  onDeleteRoad,
  onResetDefaults,
  onResetSystem,
}) => {
  // ----------------------------------------------------
  // AUTHENTICATION
  // ----------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rec_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // ----------------------------------------------------
  // GENERAL STUDIO STATE
  // ----------------------------------------------------
  const [activeSection, setActiveSection] = useState<AdminSection>('buildings');
  const [cameraMode, setCameraMode] = useState<CameraViewMode>('perspective');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [resetPasswordInput, setResetPasswordInput] = useState<string>('');
  const [resetError, setResetError] = useState<string>('');
  const [resetSuccessToast, setResetSuccessToast] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Map Click Interactive Mode ('none' | 'add-junction' | 'add-entrance')
  const [mapClickMode, setMapClickMode] = useState<'none' | 'add-junction' | 'add-entrance'>('none');

  // Selected Entities
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(locations[0]?.id || '');
  const [selectedJunctionId, setSelectedJunctionId] = useState<string | null>(null);
  const [selectedRoadId, setSelectedRoadId] = useState<string | null>(null);

  // Active Sub-tab in Junctions & Roads mode ('junctions' | 'roads')
  const [networkSubTab, setNetworkSubTab] = useState<'junctions' | 'roads'>('junctions');

  // 3D Gizmo Transform Mode for Selected Building
  const [transformMode, setTransformMode] = useState<TransformGizmoMode>('translate');

  // Search Filters
  const [buildingSearch, setBuildingSearch] = useState<string>('');
  const [buildingCategoryFilter, setBuildingCategoryFilter] = useState<string>('all');
  const [junctionSearch, setJunctionSearch] = useState<string>('');
  const [roadSearch, setRoadSearch] = useState<string>('');

  // Built-in Route Tester Drawer
  const [showRouteTester, setShowRouteTester] = useState<boolean>(false);
  const [routeStartNodeId, setRouteStartNodeId] = useState<string>(nodes[0]?.id || '');
  const [routeDestNodeId, setRouteDestNodeId] = useState<string>(nodes[nodes.length - 1]?.id || '');
  const [testRouteResult, setTestRouteResult] = useState<RouteResult | null>(null);

  // Insert Junction into Road Wizard State
  const [showInsertWizard, setShowInsertWizard] = useState<boolean>(false);
  const [insertSegmentIndex, setInsertSegmentIndex] = useState<number>(0);
  const [insertJunctionId, setInsertJunctionId] = useState<string>('');
  const [insertDistA, setInsertDistA] = useState<number>(30);
  const [insertDistB, setInsertDistB] = useState<number>(30);

  // New Entrance Dropdown Buffer
  const [entranceJunctionSelect, setEntranceJunctionSelect] = useState<string>('');

  // OrbitControls Ref
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Derived Active Navigation Graph Edges
  const derivedEdges = useMemo(() => {
    return deriveEdgesFromRoads(roads, nodes);
  }, [roads, nodes]);

  // Selected Building Object
  const currentBuilding = useMemo(() => {
    return locations.find(l => l.id === selectedBuildingId) || null;
  }, [locations, selectedBuildingId]);

  // Selected Junction Object
  const currentJunction = useMemo(() => {
    return nodes.find(n => n.id === selectedJunctionId) || null;
  }, [nodes, selectedJunctionId]);

  // Selected Road Object
  const currentRoad = useMemo(() => {
    return roads.find(r => r.id === selectedRoadId) || null;
  }, [roads, selectedRoadId]);

  // Keyboard shortcuts (ESC cancels map click mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMapClickMode('none');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // ----------------------------------------------------
  // AUTHENTICATION HANDLERS
  // ----------------------------------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('rec_admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Invalid credentials! Please enter valid admin password.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rec_admin_authenticated');
    setPasswordInput('');
  };

  // ----------------------------------------------------
  // SAVE / PERSISTENCE
  // ----------------------------------------------------
  const handleManualSave = () => {
    try {
      localStorage.setItem('rec_locations', JSON.stringify(locations));
      localStorage.setItem('rec_nodes', JSON.stringify(nodes));
      localStorage.setItem('rec_roads', JSON.stringify(roads));
      setHasUnsavedChanges(false);
      setShowSavedFeedback(true);
      setTimeout(() => setShowSavedFeedback(false), 2500);
    } catch (err) {
      console.error('Failed to save to localStorage', err);
    }
  };

  // Protective System Wipe Handler - verifies admin password
  const handleConfirmResetSystem = () => {
    if (resetPasswordInput !== ADMIN_PASSWORD) {
      setResetError('Incorrect admin password. Cannot reset system.');
      return;
    }
    onResetSystem?.();
    setShowResetModal(false);
    setResetPasswordInput('');
    setResetError('');
    setSelectedBuildingId('');
    setSelectedJunctionId(null);
    setSelectedRoadId(null);
    setTestRouteResult(null);
    setHasUnsavedChanges(false);
    setResetSuccessToast('System reset complete: All buildings, roads, and junctions have been deleted.');
    setTimeout(() => setResetSuccessToast(''), 3500);
  };

  // ----------------------------------------------------
  // 3D MAP GROUND CLICK RAYCASTING HANDLER
  // ----------------------------------------------------
  const handleMapGroundClick = (point: Vector3D) => {
    if (mapClickMode === 'add-junction') {
      const newJuncId = `node_${Date.now().toString().slice(-4)}`;
      const newJuncName = `Junction (${point.x}, ${point.z})`;
      const newNode: PathNode = {
        id: newJuncId,
        name: newJuncName,
        position: { x: point.x, y: 0.2, z: point.z },
      };
      onAddNode?.(newNode);
      setSelectedJunctionId(newJuncId);
      setNetworkSubTab('junctions');
      setMapClickMode('none');
      setHasUnsavedChanges(true);
    } else if (mapClickMode === 'add-entrance' && currentBuilding) {
      const newJuncId = `node_ent_${Date.now().toString().slice(-4)}`;
      const newJuncName = `${currentBuilding.name} Gate`;
      const newNode: PathNode = {
        id: newJuncId,
        name: newJuncName,
        position: { x: point.x, y: 0.2, z: point.z },
      };
      onAddNode?.(newNode);

      // Link to building entrances
      const existingEntrances = ensureLocationEntrances(currentBuilding, nodes);
      const newEntranceObj: Entrance = {
        id: `${currentBuilding.id}_ent_${existingEntrances.length + 1}`,
        name: `Entrance ${existingEntrances.length + 1}`,
        buildingId: currentBuilding.id,
        junctionId: newJuncId,
        position: { x: point.x, y: 0.2, z: point.z },
      };
      const updatedEntrances = [...existingEntrances, newEntranceObj];
      const updatedLoc: Location = {
        ...currentBuilding,
        entrances: updatedEntrances,
        entranceNodeIds: updatedEntrances.map(e => e.junctionId),
      };
      onUpdateLocation(updatedLoc);
      setMapClickMode('none');
      setHasUnsavedChanges(true);
    }
  };

  // ----------------------------------------------------
  // BUILDING ACTIONS
  // ----------------------------------------------------
  const handleCreateBuilding = () => {
    const defaultNodeId = nodes[0]?.id || 'node_main_gate';
    const newId = `building_${Date.now().toString().slice(-4)}`;
    const newBuilding: Location = {
      id: newId,
      name: 'New Campus Building',
      category: 'academic',
      description: 'Campus facility structure',
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      scale: [1, 1, 1],
      nodeId: defaultNodeId,
      entranceNodeIds: [defaultNodeId],
      entrances: [
        {
          id: `${newId}_ent_1`,
          name: 'Main Entrance',
          buildingId: newId,
          junctionId: defaultNodeId,
        },
      ],
    };
    onAddLocation(newBuilding);
    setSelectedBuildingId(newBuilding.id);
    setActiveSection('buildings');
    setHasUnsavedChanges(true);
  };

  const handleUpdateBuildingProperty = <K extends keyof Location>(key: K, value: Location[K]) => {
    if (!currentBuilding) return;
    const updated = { ...currentBuilding, [key]: value };
    onUpdateLocation(updated);
    setHasUnsavedChanges(true);
  };

  const handleBuildingGizmoTransform = (newPos: Vector3D, newRotY: number, newScale: number) => {
    if (!currentBuilding) return;
    const updated: Location = {
      ...currentBuilding,
      position: newPos,
      rotationY: newRotY,
      scale: [newScale, newScale, newScale],
    };
    onUpdateLocation(updated);
    setHasUnsavedChanges(true);
  };

  const handleAddBuildingEntrance = (junctionId: string, customName?: string) => {
    if (!currentBuilding || !junctionId) return;
    const existing = ensureLocationEntrances(currentBuilding, nodes);
    if (existing.some(e => e.junctionId === junctionId)) {
      alert('This junction is already assigned as an entrance.');
      return;
    }
    const nodeObj = nodes.find(n => n.id === junctionId);
    const newEnt: Entrance = {
      id: `${currentBuilding.id}_ent_${Date.now().toString().slice(-4)}`,
      name: customName || (nodeObj ? `${nodeObj.name} Gate` : `Entrance ${existing.length + 1}`),
      buildingId: currentBuilding.id,
      junctionId,
      position: nodeObj?.position,
    };
    const updatedList = [...existing, newEnt];
    const updated: Location = {
      ...currentBuilding,
      entrances: updatedList,
      entranceNodeIds: updatedList.map(e => e.junctionId),
    };
    onUpdateLocation(updated);
    setEntranceJunctionSelect('');
    setHasUnsavedChanges(true);
  };

  const handleRemoveBuildingEntrance = (entranceId: string) => {
    if (!currentBuilding) return;
    const existing = ensureLocationEntrances(currentBuilding, nodes);
    if (existing.length <= 1) {
      alert('Every building must have at least one valid entrance.');
      return;
    }
    const updatedList = existing.filter(e => e.id !== entranceId);
    const updated: Location = {
      ...currentBuilding,
      entrances: updatedList,
      entranceNodeIds: updatedList.map(e => e.junctionId),
      nodeId: updatedList[0]?.junctionId || currentBuilding.nodeId,
    };
    onUpdateLocation(updated);
    setHasUnsavedChanges(true);
  };

  const handleDeleteCurrentBuilding = () => {
    if (!currentBuilding) return;
    if (confirm(`Are you sure you want to delete "${currentBuilding.name}"?`)) {
      onDeleteLocation(currentBuilding.id);
      const remaining = locations.filter(l => l.id !== currentBuilding.id);
      setSelectedBuildingId(remaining[0]?.id || '');
      setHasUnsavedChanges(true);
    }
  };

  // ----------------------------------------------------
  // JUNCTION ACTIONS
  // ----------------------------------------------------
  const handleUpdateJunction = (updated: PathNode) => {
    onUpdateNode?.(updated);
    setHasUnsavedChanges(true);
  };

  const handleDeleteCurrentJunction = () => {
    if (!currentJunction) return;
    if (confirm(`Delete junction "${currentJunction.name}"? Roads passing through it will be updated.`)) {
      onDeleteNode?.(currentJunction.id);
      setSelectedJunctionId(null);
      setHasUnsavedChanges(true);
    }
  };

  // ----------------------------------------------------
  // ROAD ACTIONS & MANUAL DISTANCES
  // ----------------------------------------------------
  const handleCreateRoad = () => {
    if (nodes.length < 2) {
      alert('Need at least 2 junctions before creating a road.');
      return;
    }
    const newRoadId = `road_${Date.now().toString().slice(-4)}`;
    const j1 = nodes[0].id;
    const j2 = nodes[1].id;
    const initialDist = calculateEuclideanDistance(nodes[0], nodes[1]);
    const segKey = getSegmentKey(j1, j2);

    const newRoad: Road = {
      id: newRoadId,
      name: 'New Campus Boulevard',
      junctionIds: [j1, j2],
      width: 10,
      description: 'Campus pedestrian walkway',
      segmentDistances: {
        [segKey]: initialDist,
      },
    };
    onAddRoad?.(newRoad);
    setSelectedRoadId(newRoadId);
    setNetworkSubTab('roads');
    setHasUnsavedChanges(true);
  };

  const handleUpdateRoadSegmentDistance = (fromId: string, toId: string, newDistance: number) => {
    if (!currentRoad) return;
    const segKey = getSegmentKey(fromId, toId);
    const updatedDistances = {
      ...(currentRoad.segmentDistances || {}),
      [segKey]: Math.max(1, Math.round(newDistance)),
    };
    const updatedRoad: Road = {
      ...currentRoad,
      segmentDistances: updatedDistances,
    };
    onUpdateRoad?.(updatedRoad);
    setHasUnsavedChanges(true);
  };

  const handleAppendJunctionToRoad = (junctionId: string) => {
    if (!currentRoad || !junctionId) return;
    const lastJuncId = currentRoad.junctionIds[currentRoad.junctionIds.length - 1];
    if (lastJuncId === junctionId) {
      alert('Cannot connect a junction to itself consecutively.');
      return;
    }
    const lastNode = nodes.find(n => n.id === lastJuncId);
    const newNode = nodes.find(n => n.id === junctionId);
    const measuredDist = (lastNode && newNode) ? calculateEuclideanDistance(lastNode, newNode) : 40;
    const segKey = getSegmentKey(lastJuncId, junctionId);

    const updatedRoad: Road = {
      ...currentRoad,
      junctionIds: [...currentRoad.junctionIds, junctionId],
      segmentDistances: {
        ...(currentRoad.segmentDistances || {}),
        [segKey]: measuredDist,
      },
    };
    onUpdateRoad?.(updatedRoad);
    setHasUnsavedChanges(true);
  };

  const handleRemoveJunctionFromRoad = (index: number) => {
    if (!currentRoad) return;
    if (currentRoad.junctionIds.length <= 2) {
      alert('A road must contain at least 2 junctions.');
      return;
    }
    const updatedJunctions = currentRoad.junctionIds.filter((_, i) => i !== index);
    const updatedRoad: Road = {
      ...currentRoad,
      junctionIds: updatedJunctions,
    };
    onUpdateRoad?.(updatedRoad);
    setHasUnsavedChanges(true);
  };

  const handleReorderRoadJunction = (index: number, direction: 'up' | 'down') => {
    if (!currentRoad) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentRoad.junctionIds.length) return;
    const updated = [...currentRoad.junctionIds];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    const updatedRoad: Road = {
      ...currentRoad,
      junctionIds: updated,
    };
    onUpdateRoad?.(updatedRoad);
    setHasUnsavedChanges(true);
  };

  // Workflow: Insert Junction between two connected junctions in a road
  const handleExecuteInsertJunction = () => {
    if (!currentRoad || !insertJunctionId) return;
    const fromId = currentRoad.junctionIds[insertSegmentIndex];
    const toId = currentRoad.junctionIds[insertSegmentIndex + 1];
    if (!fromId || !toId) return;

    if (insertJunctionId === fromId || insertJunctionId === toId) {
      alert('Selected junction is already an endpoint of this segment.');
      return;
    }

    const newJunctionSeq = [...currentRoad.junctionIds];
    newJunctionSeq.splice(insertSegmentIndex + 1, 0, insertJunctionId);

    const oldSegKey = getSegmentKey(fromId, toId);
    const segKeyA = getSegmentKey(fromId, insertJunctionId);
    const segKeyB = getSegmentKey(insertJunctionId, toId);

    const updatedDistances = { ...(currentRoad.segmentDistances || {}) };
    delete updatedDistances[oldSegKey];
    updatedDistances[segKeyA] = Math.max(1, Math.round(insertDistA));
    updatedDistances[segKeyB] = Math.max(1, Math.round(insertDistB));

    const updatedRoad: Road = {
      ...currentRoad,
      junctionIds: newJunctionSeq,
      segmentDistances: updatedDistances,
    };

    onUpdateRoad?.(updatedRoad);
    setShowInsertWizard(false);
    setInsertJunctionId('');
    setHasUnsavedChanges(true);
  };

  const handleDeleteCurrentRoad = () => {
    if (!currentRoad) return;
    if (confirm(`Delete road "${currentRoad.name}"?`)) {
      onDeleteRoad?.(currentRoad.id);
      setSelectedRoadId(null);
      setHasUnsavedChanges(true);
    }
  };

  // ----------------------------------------------------
  // BUILT-IN SHORTEST ROUTE TESTER
  // ----------------------------------------------------
  const handleRunRouteTest = () => {
    if (!routeStartNodeId || !routeDestNodeId) return;
    const result = calculateDijkstraRoute(routeStartNodeId, routeDestNodeId, nodes, derivedEdges);
    setTestRouteResult(result);
  };

  // ----------------------------------------------------
  // CODE EXPORT GENERATOR
  // ----------------------------------------------------
  const generateExportCode = () => {
    return `// ============================================================================
// REC Campus Dataset (Exported from Admin CAD Studio)
// ============================================================================
import type { Location, PathNode, Road } from '../types';

export const PATH_NODES: PathNode[] = ${JSON.stringify(nodes, null, 2)};

export const INITIAL_ROADS: Road[] = ${JSON.stringify(roads, null, 2)};

export const LOCATIONS: Location[] = ${JSON.stringify(locations, null, 2)};
`;
  };

  // Filtered lists
  const filteredBuildings = useMemo(() => {
    return locations.filter(loc => {
      const matchSearch =
        loc.name.toLowerCase().includes(buildingSearch.toLowerCase()) ||
        (loc.block && loc.block.toLowerCase().includes(buildingSearch.toLowerCase()));
      const matchCategory =
        buildingCategoryFilter === 'all' || loc.category === buildingCategoryFilter;
      return matchSearch && matchCategory;
    });
  }, [locations, buildingSearch, buildingCategoryFilter]);

  const filteredJunctions = useMemo(() => {
    return nodes.filter(node =>
      node.name.toLowerCase().includes(junctionSearch.toLowerCase()) ||
      node.id.toLowerCase().includes(junctionSearch.toLowerCase())
    );
  }, [nodes, junctionSearch]);

  const filteredRoads = useMemo(() => {
    return roads.filter(road =>
      road.name.toLowerCase().includes(roadSearch.toLowerCase())
    );
  }, [roads, roadSearch]);

  // ----------------------------------------------------
  // IF NOT AUTHENTICATED: RENDER GATE
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="w-full h-full min-h-[calc(100vh-65px)] flex items-center justify-center p-4 bg-slate-100 dark:bg-[#080B11] text-slate-900 dark:text-white transition-colors duration-300">
        <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-purple-200 dark:border-purple-500/30 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-900 dark:text-white text-center relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-3">
            <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/40 rounded-2xl mx-auto flex items-center justify-center text-purple-600 dark:text-amber-400 shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Campus CAD Studio
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Authorized admin access required. Manage 3D buildings, entrances, junctions, and authoritative road distances.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left relative">
            <div>
              <label className="block text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="Enter password..."
                className="w-full py-3 px-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-purple-500/30 rounded-xl text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-500/50 rounded-xl text-red-700 dark:text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2 border border-purple-400/30 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Unlock CAD Editor
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // AUTHENTICATED: RENDER MAP-FIRST CAD STUDIO
  // ----------------------------------------------------
  return (
    <div className="w-full h-[calc(100vh-65px)] bg-slate-100 dark:bg-[#080B11] text-slate-900 dark:text-white relative overflow-hidden flex flex-col select-none transition-colors duration-300">
      {/* 1. TOP FLOATING COMMAND BAR */}
      <header className="h-14 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 px-4 flex items-center justify-between z-30 shrink-0">
        {/* Left: Studio Branding & Mode Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-400/30 uppercase font-mono">
              CAD STUDIO
            </span>
          </div>

          {/* TWO MAJOR ADMIN MODES SWITCHER */}
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-900/90 border border-slate-300/60 dark:border-slate-800 rounded-xl p-1 shadow-inner">
            <button
              onClick={() => {
                setActiveSection('buildings');
                setMapClickMode('none');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'buildings'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-amber-300" />
              <span>Section 1: Buildings</span>
            </button>
            <button
              onClick={() => {
                setActiveSection('junctions-roads');
                setMapClickMode('none');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSection === 'junctions-roads'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Route className="w-3.5 h-3.5 text-cyan-300" />
              <span>Section 2: Junctions & Roads</span>
            </button>
          </div>
        </div>

        {/* Center: Camera Mode Toggle & Tools */}
        <div className="hidden md:flex items-center gap-2">
          {/* Camera Perspective vs Top-down */}
          <div className="flex items-center bg-slate-200/60 dark:bg-slate-900/90 border border-slate-300/60 dark:border-slate-800 rounded-xl p-0.5">
            <button
              onClick={() => setCameraMode('perspective')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                cameraMode === 'perspective'
                  ? 'bg-white dark:bg-slate-800 text-purple-700 dark:text-amber-300 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="3D Orbit Perspective View"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>3D Orbit</span>
            </button>
            <button
              onClick={() => setCameraMode('top')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                cameraMode === 'top'
                  ? 'bg-white dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 shadow'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Top-down 2D Map View (GIS Alignment)"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>2D Top View</span>
            </button>
          </div>

          {/* Shortest Route Tester Toggle */}
          <button
            onClick={() => setShowRouteTester(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
              showRouteTester
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-lg'
                : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:text-purple-600 dark:hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
            <span>Path Tester</span>
          </button>
        </div>

        {/* Right: Actions, Save, Export, Logout */}
        <div className="flex items-center gap-2">
          {/* Save Status */}
          {showSavedFeedback ? (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-lg border border-emerald-300 dark:border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          ) : hasUnsavedChanges ? (
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-500/40 animate-pulse">
              ● Unsaved edits
            </span>
          ) : (
            <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
              All synced
            </span>
          )}

          {/* Save Button */}
          <button
            onClick={handleManualSave}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Export Code */}
          <button
            onClick={() => setShowExportModal(true)}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            title="Export recCampusData.ts Code"
          >
            <Copy className="w-4 h-4" />
          </button>

          {/* RESET SYSTEM Button */}
          <button
            onClick={() => {
              setShowResetModal(true);
              setResetPasswordInput('');
              setResetError('');
            }}
            className="px-3 py-1.5 bg-red-100 dark:bg-red-950/70 hover:bg-red-600 hover:text-white border border-red-300 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-xl text-xs font-black transition-all shadow-sm active:scale-95 flex items-center gap-1.5 cursor-pointer"
            title="Reset System - Delete All Buildings, Roads and Junctions"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            <span>RESET SYSTEM</span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs transition-all cursor-pointer shadow-sm"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Floating Success Toast */}
      {resetSuccessToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{resetSuccessToast}</span>
        </div>
      )}

      {/* 2. MAP VIEWPORT & FLOATING PANELS WRAPPER */}
      <div className="flex-1 relative w-full h-full overflow-hidden">
        {/* Active Map Click Banner if Armed */}
        {mapClickMode !== 'none' && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-amber-500 text-slate-950 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-3 font-bold text-xs animate-bounce border-2 border-white">
            <Crosshair className="w-4 h-4 animate-spin" />
            <span>
              {mapClickMode === 'add-junction'
                ? 'CLICK ANYWHERE ON MAP TO PLACE A NEW JUNCTION'
                : `CLICK ON MAP NEAR "${currentBuilding?.name}" TO PLACE ENTRANCE`}
            </span>
            <button
              onClick={() => setMapClickMode('none')}
              className="px-2 py-0.5 bg-slate-950 text-white text-[10px] rounded-lg font-mono hover:bg-slate-800 cursor-pointer"
            >
              Cancel (ESC)
            </button>
          </div>
        )}

        {/* 3D CENTRAL CAMPUS SCENE */}
        <div className="absolute inset-0 z-0">
          <CampusScene
            locations={locations}
            selectedLocation={activeSection === 'buildings' ? currentBuilding : null}
            onSelectLocation={(loc) => {
              setSelectedBuildingId(loc.id);
              setActiveSection('buildings');
            }}
            activeRoute={testRouteResult}
            startLocation={null}
            destinationLocation={null}
            showLabels={true}
            showRoads={true}
            brightness={1.3}
            controlsRef={controlsRef}
            nodes={nodes}
            edges={derivedEdges}
            showJunctionMarkers={true}
            cameraMode={cameraMode}
            activeSection={activeSection}
            selectedJunctionId={selectedJunctionId}
            onSelectJunction={(node) => {
              setSelectedJunctionId(node.id);
              setActiveSection('junctions-roads');
              setNetworkSubTab('junctions');
            }}
            selectedRoadId={selectedRoadId}
            onSelectRoad={(roadId) => {
              setSelectedRoadId(roadId);
              setActiveSection('junctions-roads');
              setNetworkSubTab('roads');
            }}
            onMapClick={handleMapGroundClick}
            isAddMode={mapClickMode !== 'none'}
            transformMode={activeSection === 'buildings' ? transformMode : null}
            onBuildingTransform={handleBuildingGizmoTransform}
            roads={roads}
          />
        </div>

        {/* 3. LEFT FLOATING DIRECTORY PANEL */}
        <aside className="absolute left-3 top-3 bottom-3 w-80 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl z-10 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
          {/* SECTION 1: BUILDINGS DIRECTORY */}
          {activeSection === 'buildings' && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-black text-sm text-slate-900 dark:text-white">Buildings</span>
                    <span className="text-[10px] font-mono bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 px-1.5 py-0.5 rounded-full">
                      {locations.length}
                    </span>
                  </div>
                  <button
                    onClick={handleCreateBuilding}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New</span>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                  <input
                    type="text"
                    value={buildingSearch}
                    onChange={(e) => setBuildingSearch(e.target.value)}
                    placeholder="Search buildings..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                {/* Category Filter Chips */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[10px]">
                  <button
                    onClick={() => setBuildingCategoryFilter('all')}
                    className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-all ${
                      buildingCategoryFilter === 'all'
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    All
                  </button>
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setBuildingCategoryFilter(cat.id)}
                      className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap cursor-pointer transition-all ${
                        buildingCategoryFilter === cat.id
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {cat.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Buildings List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredBuildings.map(loc => {
                  const isSelected = selectedBuildingId === loc.id;
                  const entrancesCount = loc.entrances?.length || loc.entranceNodeIds?.length || 1;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedBuildingId(loc.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-500/50 shadow-sm ring-1 ring-purple-500/40 text-purple-900 dark:text-purple-100'
                          : 'bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200/70 dark:border-transparent text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{loc.name}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="capitalize">{loc.category}</span>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-mono">🚪 {entrancesCount} ent</span>
                        </div>
                      </div>
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                        style={{
                          backgroundColor:
                            loc.category === 'academic'
                              ? '#3B82F6'
                              : loc.category === 'food'
                                ? '#F59E0B'
                                : loc.category === 'hostel'
                                  ? '#8B5CF6'
                                  : loc.category === 'sports'
                                    ? '#10B981'
                                    : '#EC4899',
                        }}
                      />
                    </button>
                  );
                })}
                {filteredBuildings.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                    <p>No buildings found.</p>
                    <button
                      onClick={handleCreateBuilding}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow cursor-pointer transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add First Building</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 2: JUNCTIONS & ROADS DIRECTORY */}
          {activeSection === 'junctions-roads' && (
            <div className="flex flex-col h-full">
              {/* Sub-tabs */}
              <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2">
                <div className="grid grid-cols-2 gap-1 bg-slate-200/60 dark:bg-slate-900/80 p-0.5 rounded-xl border border-slate-300/60 dark:border-slate-800">
                  <button
                    onClick={() => setNetworkSubTab('junctions')}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      networkSubTab === 'junctions'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Milestone className="w-3.5 h-3.5" />
                    <span>Junctions ({nodes.length})</span>
                  </button>
                  <button
                    onClick={() => setNetworkSubTab('roads')}
                    className={`py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      networkSubTab === 'roads'
                        ? 'bg-cyan-600 text-white shadow'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Route className="w-3.5 h-3.5" />
                    <span>Roads ({roads.length})</span>
                  </button>
                </div>

                {/* Sub-tab Specific Action Button */}
                {networkSubTab === 'junctions' ? (
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={junctionSearch}
                        onChange={(e) => setJunctionSearch(e.target.value)}
                        placeholder="Search junctions..."
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      onClick={() => setMapClickMode('add-junction')}
                      className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer transition-all ${
                        mapClickMode === 'add-junction'
                          ? 'bg-amber-500 text-slate-950 ring-2 ring-white'
                          : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                      }`}
                      title="Click on map to add junction"
                    >
                      <Crosshair className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={roadSearch}
                        onChange={(e) => setRoadSearch(e.target.value)}
                        placeholder="Search roads..."
                        className="w-full pl-8 pr-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <button
                      onClick={handleCreateRoad}
                      className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow cursor-pointer transition-all active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New</span>
                    </button>
                  </div>
                )}
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {networkSubTab === 'junctions' ? (
                  filteredJunctions.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                      <p>No junctions found.</p>
                      <button
                        onClick={() => setMapClickMode('add-junction')}
                        className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Place Junction on Map</span>
                      </button>
                    </div>
                  ) : (
                    filteredJunctions.map(node => {
                      const isSelected = selectedJunctionId === node.id;
                      const connectedRoadsCount = roads.filter(r => r.junctionIds.includes(node.id)).length;
                      return (
                        <button
                          key={node.id}
                          onClick={() => setSelectedJunctionId(node.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/40 text-cyan-900 dark:text-cyan-100'
                              : 'bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200/70 dark:border-transparent text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{node.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span>X: {node.position.x} Z: {node.position.z}</span>
                              <span>•</span>
                              <span className="text-cyan-600 dark:text-cyan-400">{connectedRoadsCount} rds</span>
                            </div>
                          </div>
                          <Milestone className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        </button>
                      );
                    })
                  )
                ) : (
                  filteredRoads.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500 space-y-2">
                      <p>No roads found.</p>
                      <button
                        onClick={handleCreateRoad}
                        disabled={nodes.length < 2}
                        className="px-3 py-1.5 bg-cyan-600 disabled:opacity-40 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow cursor-pointer transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create Road</span>
                      </button>
                    </div>
                  ) : (
                    filteredRoads.map(road => {
                      const isSelected = selectedRoadId === road.id;
                      // Calculate total road distance from configured segment distances
                      let roadMeters = 0;
                      for (let i = 0; i < road.junctionIds.length - 1; i++) {
                        const k = getSegmentKey(road.junctionIds[i], road.junctionIds[i + 1]);
                        roadMeters += road.segmentDistances?.[k] || 35;
                      }

                      return (
                        <button
                          key={road.id}
                          onClick={() => setSelectedRoadId(road.id)}
                          className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-2 cursor-pointer ${
                            isSelected
                              ? 'bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-300 dark:border-cyan-500/50 shadow-sm ring-1 ring-cyan-500/40 text-cyan-900 dark:text-cyan-100'
                              : 'bg-slate-50/70 dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/80 border border-slate-200/70 dark:border-transparent text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{road.name}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                              <span className="text-cyan-600 dark:text-cyan-400">{road.junctionIds.length} nodes</span>
                              <span>•</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{roadMeters}m</span>
                            </div>
                          </div>
                          <Route className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        </button>
                      );
                    })
                  )
                )}
              </div>
            </div>
          )}
        </aside>

        {/* 4. RIGHT FLOATING CONTEXTUAL INSPECTOR PANEL */}
        <aside className="absolute right-3 top-3 bottom-3 w-96 bg-white/90 dark:bg-slate-950/90 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl z-10 shadow-2xl flex flex-col overflow-hidden text-slate-900 dark:text-white transition-colors duration-300">
          {/* CASE A: INSPECTING A BUILDING */}
          {activeSection === 'buildings' && currentBuilding && (
            <div className="flex flex-col h-full">
              {/* Building Header */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wider">
                    Building Inspector
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {currentBuilding.name}
                  </h3>
                </div>
                <button
                  onClick={handleDeleteCurrentBuilding}
                  className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all cursor-pointer"
                  title="Delete Building"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* 3D Transform Gizmo Mode Toolbar */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                    <span>3D Scene Transform Gizmo</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1 bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl border border-slate-300/60 dark:border-slate-800">
                    <button
                      onClick={() => setTransformMode('translate')}
                      className={`py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                        transformMode === 'translate'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Move
                    </button>
                    <button
                      onClick={() => setTransformMode('rotate')}
                      className={`py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                        transformMode === 'rotate'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Rotate
                    </button>
                    <button
                      onClick={() => setTransformMode('scale')}
                      className={`py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                        transformMode === 'scale'
                          ? 'bg-purple-600 text-white shadow'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Scale
                    </button>
                    <button
                      onClick={() => setTransformMode(null)}
                      className={`py-1 rounded-lg font-bold text-[11px] cursor-pointer transition-all ${
                        transformMode === null
                          ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-300 shadow'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Off
                    </button>
                  </div>
                </div>

                {/* Direct Transform Input Fields */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-3">
                  {/* Position Coordinates */}
                  <div>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">World Position (meters)</span>
                    <div className="grid grid-cols-3 gap-2 mt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">X</span>
                        <input
                          type="number"
                          value={currentBuilding.position.x}
                          onChange={(e) =>
                            handleUpdateBuildingProperty('position', {
                              ...currentBuilding.position,
                              x: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Y (elev)</span>
                        <input
                          type="number"
                          value={currentBuilding.position.y}
                          onChange={(e) =>
                            handleUpdateBuildingProperty('position', {
                              ...currentBuilding.position,
                              y: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Z</span>
                        <input
                          type="number"
                          value={currentBuilding.position.z}
                          onChange={(e) =>
                            handleUpdateBuildingProperty('position', {
                              ...currentBuilding.position,
                              z: Number(e.target.value),
                            })
                          }
                          className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rotation Y */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Rotation Y (Orient to Campus)</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">{currentBuilding.rotationY || 0}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={currentBuilding.rotationY || 0}
                      onChange={(e) => handleUpdateBuildingProperty('rotationY', Number(e.target.value))}
                      className="w-full mt-1 accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Scale */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      <span>Scale Factor</span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {Array.isArray(currentBuilding.scale)
                          ? currentBuilding.scale[0]
                          : typeof currentBuilding.scale === 'number'
                            ? currentBuilding.scale
                            : 1}x
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="3.5"
                      step="0.05"
                      value={
                        Array.isArray(currentBuilding.scale)
                          ? currentBuilding.scale[0]
                          : typeof currentBuilding.scale === 'number'
                            ? currentBuilding.scale
                            : 1
                      }
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        handleUpdateBuildingProperty('scale', [val, val, val]);
                      }}
                      className="w-full mt-1 accent-purple-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Building Details Form */}
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Building Name
                    </label>
                    <input
                      type="text"
                      value={currentBuilding.name}
                      onChange={(e) => handleUpdateBuildingProperty('name', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        Category
                      </label>
                      <select
                        value={currentBuilding.category}
                        onChange={(e) => handleUpdateBuildingProperty('category', e.target.value as CategoryId)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      >
                        {CATEGORIES.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                        3D GLB Model
                      </label>
                      <select
                        value={currentBuilding.modelKey || ''}
                        onChange={(e) => handleUpdateBuildingProperty('modelKey', e.target.value || undefined)}
                        className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="">Procedural Fallback</option>
                        {Object.keys(ASSET_MANIFEST).map(key => (
                          <option key={key} value={key}>
                            {ASSET_MANIFEST[key].name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={currentBuilding.description || ''}
                      onChange={(e) => handleUpdateBuildingProperty('description', e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 resize-none"
                    />
                  </div>
                </div>

                {/* MULTIPLE ENTRANCES SECTION (CRITICAL FEATURE) */}
                <div className="p-3 bg-purple-50/80 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/30 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>Building Entrances ({ensureLocationEntrances(currentBuilding, nodes).length})</span>
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                        Multiple gates/entrances connecting to the road graph.
                      </p>
                    </div>
                  </div>

                  {/* List of Entrances */}
                  <div className="space-y-1.5">
                    {ensureLocationEntrances(currentBuilding, nodes).map((entrance) => {
                      const linkedNode = nodes.find(n => n.id === entrance.junctionId);
                      return (
                        <div
                          key={entrance.id}
                          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center justify-between gap-2 shadow-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-xs text-emerald-600 dark:text-emerald-300 truncate">
                              🚪 {entrance.name}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                              ➔ {linkedNode ? linkedNode.name : entrance.junctionId}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveBuildingEntrance(entrance.id)}
                            className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded transition-colors cursor-pointer"
                            title="Remove Entrance"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Add Entrance Controls */}
                  <div className="pt-2 border-t border-purple-200 dark:border-purple-500/20 space-y-2">
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 uppercase">Connect Another Entrance</span>
                    <div className="flex items-center gap-1.5">
                      <select
                        value={entranceJunctionSelect}
                        onChange={(e) => setEntranceJunctionSelect(e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                      >
                        <option value="">Select Existing Junction...</option>
                        {nodes.map(n => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          if (entranceJunctionSelect) {
                            handleAddBuildingEntrance(entranceJunctionSelect);
                          }
                        }}
                        disabled={!entranceJunctionSelect}
                        className="px-2.5 py-1.5 bg-purple-600 disabled:opacity-40 hover:bg-purple-500 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
                      >
                        Add
                      </button>
                    </div>

                    {/* Or Click on Map near building */}
                    <button
                      onClick={() => setMapClickMode('add-entrance')}
                      className={`w-full py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        mapClickMode === 'add-entrance'
                          ? 'bg-amber-500 text-slate-950 shadow'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                      }`}
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Click Map to Place Entrance</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE B: INSPECTING A JUNCTION */}
          {activeSection === 'junctions-roads' && networkSubTab === 'junctions' && currentJunction && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                    Junction Inspector
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {currentJunction.name}
                  </h3>
                </div>
                <button
                  onClick={handleDeleteCurrentJunction}
                  className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all cursor-pointer"
                  title="Delete Junction"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Junction Name
                  </label>
                  <input
                    type="text"
                    value={currentJunction.name}
                    onChange={(e) => handleUpdateJunction({ ...currentJunction, name: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 space-y-2">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">3D Coordinates</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">X Position</span>
                      <input
                        type="number"
                        value={currentJunction.position.x}
                        onChange={(e) =>
                          handleUpdateJunction({
                            ...currentJunction,
                            position: { ...currentJunction.position, x: Number(e.target.value) },
                          })
                        }
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Z Position</span>
                      <input
                        type="number"
                        value={currentJunction.position.z}
                        onChange={(e) =>
                          handleUpdateJunction({
                            ...currentJunction,
                            position: { ...currentJunction.position, z: Number(e.target.value) },
                          })
                        }
                        className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Roads Passing Through this Junction */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Connected Roads (
                    {roads.filter(r => r.junctionIds.includes(currentJunction.id)).length}
                    )
                  </span>
                  <div className="space-y-1">
                    {roads
                      .filter(r => r.junctionIds.includes(currentJunction.id))
                      .map(r => (
                        <div
                          key={r.id}
                          onClick={() => {
                            setSelectedRoadId(r.id);
                            setNetworkSubTab('roads');
                          }}
                          className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-xs font-bold text-cyan-600 dark:text-cyan-300 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>{r.name}</span>
                          <Route className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        </div>
                      ))}
                  </div>
                </div>

                {/* Buildings that use this Junction as Entrance */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Serving Buildings (
                    {
                      locations.filter(l =>
                        (l.entranceNodeIds || [l.nodeId]).includes(currentJunction.id)
                      ).length
                    }
                    )
                  </span>
                  <div className="space-y-1">
                    {locations
                      .filter(l => (l.entranceNodeIds || [l.nodeId]).includes(currentJunction.id))
                      .map(l => (
                        <div
                          key={l.id}
                          onClick={() => {
                            setSelectedBuildingId(l.id);
                            setActiveSection('buildings');
                          }}
                          className="p-2 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-xs font-bold text-purple-600 dark:text-purple-300 border border-slate-200 dark:border-slate-800 flex items-center justify-between cursor-pointer"
                        >
                          <span>{l.name}</span>
                          <Building className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CASE C: INSPECTING A ROAD & AUTHORITATIVE DISTANCES */}
          {activeSection === 'junctions-roads' && networkSubTab === 'roads' && currentRoad && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 uppercase font-bold tracking-wider">
                    Road & Distances Inspector
                  </div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white truncate mt-0.5">
                    {currentRoad.name}
                  </h3>
                </div>
                <button
                  onClick={handleDeleteCurrentRoad}
                  className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg transition-all cursor-pointer"
                  title="Delete Road"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
                {/* Road Name & Width */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Road Corridor Name
                    </label>
                    <input
                      type="text"
                      value={currentRoad.name}
                      onChange={(e) => {
                        const updated = { ...currentRoad, name: e.target.value };
                        onUpdateRoad?.(updated);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                      Road Width (meters in 3D scene)
                    </label>
                    <input
                      type="number"
                      value={currentRoad.width || 10}
                      onChange={(e) => {
                        const updated = { ...currentRoad, width: Number(e.target.value) };
                        onUpdateRoad?.(updated);
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>

                {/* Ordered Sequence of Junctions */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                      Ordered Junction Sequence ({currentRoad.junctionIds.length})
                    </span>
                  </div>

                  <div className="space-y-1">
                    {currentRoad.junctionIds.map((jId, idx) => {
                      const nodeObj = nodes.find(n => n.id === jId);
                      return (
                        <div
                          key={`${jId}-${idx}`}
                          className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-2 rounded-lg flex items-center justify-between gap-1.5 shadow-sm"
                        >
                          <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 w-5">#{idx + 1}</span>
                          <span className="font-bold text-xs text-slate-900 dark:text-white flex-1 truncate">
                            {nodeObj ? nodeObj.name : jId}
                          </span>
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={() => handleReorderRoadJunction(idx, 'up')}
                              disabled={idx === 0}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleReorderRoadJunction(idx, 'down')}
                              disabled={idx === currentRoad.junctionIds.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-20 cursor-pointer"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleRemoveJunctionFromRoad(idx)}
                              disabled={currentRoad.junctionIds.length <= 2}
                              className="p-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-20 cursor-pointer ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Append Junction to End */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <select
                      id="append-junction-select"
                      className="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="">Append junction to end...</option>
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        const sel = document.getElementById('append-junction-select') as HTMLSelectElement;
                        if (sel && sel.value) {
                          handleAppendJunctionToRoad(sel.value);
                          sel.value = '';
                        }
                      }}
                      className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Append
                    </button>
                  </div>
                </div>

                {/* AUTHORITATIVE SEGMENT DISTANCE TABLE (CRITICAL REQUIREMENT) */}
                <div className="p-3 bg-cyan-50/80 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-500/30 rounded-xl space-y-2.5">
                  <div>
                    <h4 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Ruler className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>Authoritative Segment Distances</span>
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Shortest path navigation uses these exact walking meters (never blind 3D geometry).
                    </p>
                  </div>

                  <div className="space-y-2">
                    {currentRoad.junctionIds.slice(0, -1).map((fromId, i) => {
                      const toId = currentRoad.junctionIds[i + 1];
                      const fromNode = nodes.find(n => n.id === fromId);
                      const toNode = nodes.find(n => n.id === toId);
                      const segKey = getSegmentKey(fromId, toId);

                      const measured = (fromNode && toNode)
                        ? calculateEuclideanDistance(fromNode, toNode)
                        : 30;

                      const manualDist = currentRoad.segmentDistances?.[segKey] ?? measured;

                      return (
                        <div
                          key={`seg-${i}-${segKey}`}
                          className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1 shadow-sm"
                        >
                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-slate-200">
                            <span className="truncate">{fromNode?.name || fromId}</span>
                            <span className="text-cyan-600 dark:text-cyan-400 px-1">↔</span>
                            <span className="truncate">{toNode?.name || toId}</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Manual:</span>
                              <input
                                type="number"
                                min="1"
                                value={manualDist}
                                onChange={(e) =>
                                  handleUpdateRoadSegmentDistance(fromId, toId, Number(e.target.value))
                                }
                                className="w-18 px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-cyan-500/50 rounded text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none"
                              />
                              <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">meters</span>
                            </div>

                            <button
                              onClick={() => handleUpdateRoadSegmentDistance(fromId, toId, measured)}
                              className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 cursor-pointer font-mono"
                              title="Reset to 3D straight-line measured distance"
                            >
                              Measured: {measured}m
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* INSERT JUNCTION INTO ROAD WIZARD (CRITICAL REQUIREMENT) */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <Split className="w-3.5 h-3.5" />
                      <span>Insert Junction into Road</span>
                    </span>
                    <button
                      onClick={() => setShowInsertWizard(prev => !prev)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
                    >
                      {showInsertWizard ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {showInsertWizard && (
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">
                        Splits an existing segment into two, automatically configuring both new distances.
                      </p>

                      {/* Select Segment */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Between Segment:
                        </label>
                        <select
                          value={insertSegmentIndex}
                          onChange={(e) => setInsertSegmentIndex(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                        >
                          {currentRoad.junctionIds.slice(0, -1).map((fId, idx) => {
                            const tId = currentRoad.junctionIds[idx + 1];
                            const fNode = nodes.find(n => n.id === fId);
                            const tNode = nodes.find(n => n.id === tId);
                            return (
                              <option key={idx} value={idx}>
                                #{idx + 1}: {fNode?.name || fId} ➔ {tNode?.name || tId}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      {/* Select Junction to Insert */}
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          Junction to Insert:
                        </label>
                        <select
                          value={insertJunctionId}
                          onChange={(e) => {
                            const jId = e.target.value;
                            setInsertJunctionId(jId);
                            const fId = currentRoad.junctionIds[insertSegmentIndex];
                            const tId = currentRoad.junctionIds[insertSegmentIndex + 1];
                            const fNode = nodes.find(n => n.id === fId);
                            const tNode = nodes.find(n => n.id === tId);
                            const iNode = nodes.find(n => n.id === jId);
                            if (fNode && iNode) {
                              setInsertDistA(calculateEuclideanDistance(fNode, iNode));
                            }
                            if (iNode && tNode) {
                              setInsertDistB(calculateEuclideanDistance(iNode, tNode));
                            }
                          }}
                          className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
                        >
                          <option value="">Select junction...</option>
                          {nodes.map(n => (
                            <option key={n.id} value={n.id}>
                              {n.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Distances inputs */}
                      {insertJunctionId && (
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">First Segment (m)</span>
                            <input
                              type="number"
                              value={insertDistA}
                              onChange={(e) => setInsertDistA(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400">Second Segment (m)</span>
                            <input
                              type="number"
                              value={insertDistB}
                              onChange={(e) => setInsertDistB(Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-mono text-slate-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      <button
                        onClick={handleExecuteInsertJunction}
                        disabled={!insertJunctionId}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-black rounded-lg text-xs cursor-pointer shadow transition-all"
                      >
                        Confirm Insertion
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Fallback if nothing selected */}
          {((activeSection === 'buildings' && !currentBuilding) ||
            (activeSection === 'junctions-roads' && networkSubTab === 'junctions' && !currentJunction) ||
            (activeSection === 'junctions-roads' && networkSubTab === 'roads' && !currentRoad)) && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 dark:text-slate-500 space-y-2">
              <Compass className="w-8 h-8 text-slate-300 dark:text-slate-600 animate-pulse" />
              <p className="text-xs">Select an item from the left directory or directly on the 3D map to inspect.</p>
            </div>
          )}
        </aside>

        {/* 5. BOTTOM FLOATING ROUTE TESTER DRAWER */}
        {showRouteTester && (
          <div className="absolute bottom-3 left-86 right-100 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl border border-amber-400/60 dark:border-amber-500/40 rounded-2xl p-4 z-20 shadow-2xl space-y-3 max-h-64 overflow-y-auto text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span className="font-black text-xs text-slate-900 dark:text-white">Interactive Dijkstra Shortest Path Tester</span>
              </div>
              <button
                onClick={() => setShowRouteTester(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-xs cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Start Junction</label>
                <select
                  value={routeStartNodeId}
                  onChange={(e) => setRouteStartNodeId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">Target Destination</label>
                <select
                  value={routeDestNodeId}
                  onChange={(e) => setRouteDestNodeId(e.target.value)}
                  className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
                >
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>
                      {n.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleRunRouteTest}
                  className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-xs transition-all shadow cursor-pointer"
                >
                  Calculate Shortest Path
                </button>
              </div>
            </div>

            {/* Test Results Display */}
            {testRouteResult ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    Route Found: {testRouteResult.distance}m (~{testRouteResult.walkingTime} min walk)
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {testRouteResult.nodes.length} nodes traversed
                  </span>
                </div>

                {/* Step Breakdown */}
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {testRouteResult.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="text-[11px] text-slate-700 dark:text-slate-300 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/50 pb-0.5"
                    >
                      <span>
                        #{idx + 1}. {step.instruction}
                      </span>
                      <span className="font-mono text-cyan-600 dark:text-cyan-400 shrink-0 ml-2">{step.distance}m</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                Select start and target junctions above, then click Calculate to visually verify the routing graph.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 6. PROTECTED SYSTEM RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-red-300 dark:border-red-500/50 rounded-2xl p-6 space-y-4 shadow-2xl text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-red-500 dark:text-red-400">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">RESET SYSTEM — WIPE ALL DATA</h3>
              </div>
              <button
                onClick={() => setShowResetModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/40 rounded-xl space-y-1.5 text-xs text-red-700 dark:text-red-200">
              <p className="font-bold text-red-600 dark:text-red-300">
                ⚠️ WARNING: Destructive System Action!
              </p>
              <p className="leading-relaxed">
                This will permanently delete <strong>all buildings</strong>, <strong>all roads</strong>, and <strong>all junctions</strong> from the campus navigation database.
              </p>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleConfirmResetSystem();
              }}
              className="space-y-3.5"
            >
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  Enter Admin Password to confirm wipe:
                </label>
                <input
                  type="password"
                  value={resetPasswordInput}
                  onChange={(e) => {
                    setResetPasswordInput(e.target.value);
                    if (resetError) setResetError('');
                  }}
                  placeholder="Enter Admin Password..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-red-300 dark:border-red-500/50 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 transition-all placeholder-slate-400 dark:placeholder-slate-600 shadow-inner"
                  autoFocus
                />
              </div>

              {resetError && (
                <div className="p-2.5 bg-red-50 dark:bg-red-950/80 border border-red-200 dark:border-red-600/60 rounded-xl text-red-700 dark:text-red-200 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500 dark:text-red-400" />
                  <span>{resetError}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                {/* Secondary Option: Restore Factory Defaults */}
                {onResetDefaults && (
                  <button
                    type="button"
                    onClick={() => {
                      if (resetPasswordInput !== ADMIN_PASSWORD) {
                        setResetError('Admin password required to restore defaults.');
                        return;
                      }
                      onResetDefaults();
                      setShowResetModal(false);
                      setResetPasswordInput('');
                      setResetError('');
                      setSelectedBuildingId(locations[0]?.id || '');
                      setSelectedJunctionId(null);
                      setSelectedRoadId(null);
                      setTestRouteResult(null);
                      setHasUnsavedChanges(false);
                      setResetSuccessToast('Campus restored to factory defaults!');
                      setTimeout(() => setResetSuccessToast(''), 3000);
                    }}
                    className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 underline cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                    <span>Restore Defaults instead</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!resetPasswordInput.trim()}
                    className="px-4 py-2 bg-red-600 disabled:opacity-40 hover:bg-red-500 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-95"
                  >
                    Wipe System
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EXPORT CODE MODAL */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-500/40 rounded-2xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh] text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Copy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Export recCampusData.ts Configuration</h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Copy this TypeScript seed file to permanently bake all your visual building edits, junctions, roads, and manual distances into the source code repository.
            </p>
            <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
              <pre className="text-[11px] font-mono text-purple-900 dark:text-purple-200 leading-relaxed whitespace-pre-wrap">
                {generateExportCode()}
              </pre>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateExportCode());
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow cursor-pointer transition-all"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Copied to Clipboard!' : 'Copy Entire Code'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
