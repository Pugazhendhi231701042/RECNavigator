import React, { useState } from 'react';
import type { Location, CategoryId } from '../types';
import { PATH_NODES, PATH_EDGES } from '../data/recCampusData';
import { CampusScene } from '../components/3d/CampusScene';
import { ShieldCheck, MapPin, Save, Compass, Copy, Check, RotateCw, Lock, KeyRound, AlertCircle, LogOut } from 'lucide-react';

interface AdminPageProps {
  locations: Location[];
  onAddLocation: (newLoc: Location) => void;
  onUpdateLocation: (updatedLoc: Location) => void;
  onDeleteLocation: (id: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({
  locations,
  onUpdateLocation,
}) => {
  // Admin Authentication State (Protected by password: Admin@2711)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('rec_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'editor' | 'locations' | 'graph'>('editor');
  const [selectedLocId, setSelectedLocId] = useState<string>(locations[0]?.id || '');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Active location being adjusted
  const selectedLoc = locations.find(l => l.id === selectedLocId) || locations[0];

  // Editable Form State
  const [name, setName] = useState(selectedLoc?.name || '');
  const [category, setCategory] = useState<CategoryId>(selectedLoc?.category || 'academic');
  const [desc, setDesc] = useState(selectedLoc?.description || '');
  const [posX, setPosX] = useState<number>(selectedLoc?.position.x || 0);
  const [posY, setPosY] = useState<number>(selectedLoc?.position.y || 0);
  const [posZ, setPosZ] = useState<number>(selectedLoc?.position.z || 0);
  const [rotY, setRotY] = useState<number>(selectedLoc?.rotationY || 0);
  const [nodeId, setNodeId] = useState<string>(selectedLoc?.nodeId || PATH_NODES[0].id);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'Admin@2711') {
      setIsAuthenticated(true);
      sessionStorage.setItem('rec_admin_authenticated', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect Password! Please enter valid admin credentials.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('rec_admin_authenticated');
    setPasswordInput('');
  };

  const handleSelectBuildingToEdit = (loc: Location) => {
    setSelectedLocId(loc.id);
    setName(loc.name);
    setCategory(loc.category);
    setDesc(loc.description || '');
    setPosX(loc.position.x);
    setPosY(loc.position.y);
    setPosZ(loc.position.z);
    setRotY(loc.rotationY || 0);
    setNodeId(loc.nodeId);
  };

  const handleSaveCurrentLocation = () => {
    if (!selectedLoc) return;
    const updated: Location = {
      ...selectedLoc,
      name,
      category,
      description: desc,
      position: { x: Number(posX), y: Number(posY), z: Number(posZ) },
      rotationY: Number(rotY),
      nodeId,
    };
    onUpdateLocation(updated);
  };

  const generateTsCode = () => {
    return JSON.stringify(locations, null, 2);
  };

  const handleCopyTsCode = () => {
    navigator.clipboard.writeText(generateTsCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // IF NOT AUTHENTICATED: RENDER ADMIN LOGIN PASSWORD GATE
  if (!isAuthenticated) {
    return (
      <div className="w-full min-h-[calc(100vh-65px)] flex items-center justify-center p-4 bg-[#FAFAFA]">
        <div className="w-full max-w-md bg-white border border-purple-100 rounded-3xl p-8 shadow-2xl space-y-6 text-slate-900 text-center relative overflow-hidden">
          {/* Top Decorative Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-100 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-100 rounded-full blur-3xl" />

          {/* Lock Header */}
          <div className="relative space-y-3">
            <div className="w-16 h-16 bg-purple-50 border border-purple-200 rounded-2xl mx-auto flex items-center justify-center text-[#D97706] shadow-md">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-[#6A1B9A] tracking-tight">Admin Portal Access</h2>
            <p className="text-xs text-[#6A7282]">
              Enter the administrator password to manage 3D building positions, rotation angles, and road network settings.
            </p>
          </div>

          {/* Password Form */}
          <form onSubmit={handleLogin} className="space-y-4 text-left relative">
            <div>
              <label className="block text-xs font-extrabold text-[#6A1B9A] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#D97706]" />
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  if (authError) setAuthError('');
                }}
                placeholder="Enter admin password..."
                className="w-full py-3 px-4 bg-[#FAFAFA] border border-purple-200 rounded-xl text-sm font-bold text-slate-900 placeholder-[#6A7282] focus:outline-none focus:ring-2 focus:ring-[#6A1B9A] transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 bg-[#6A1B9A] hover:bg-purple-800 text-white font-extrabold text-sm rounded-xl shadow-lg transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              Unlock Admin Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: RENDER FULL ADMIN PORTAL
  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-[#FAFAFA] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24">
        {/* Header Banner */}
        <div className="bg-white border border-purple-100 p-6 rounded-3xl shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#D97706] text-xs font-extrabold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#D97706]" />
              Authenticated Administrator Portal
            </div>
            <h2 className="text-2xl font-black text-[#6A1B9A]">Visual 3D Building Rotation & Map Alignment</h2>
            <p className="text-xs text-[#6A7282] mt-1">
              Rotate buildings, adjust 3D positions, toggle roads, and align models over the campus map texture.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'editor' ? 'bg-[#6A1B9A] text-white shadow-md' : 'bg-purple-50 text-[#6A1B9A] hover:bg-purple-100'
              }`}
            >
              Live 3D Editor
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'locations' ? 'bg-[#6A1B9A] text-white shadow-md' : 'bg-purple-50 text-[#6A1B9A] hover:bg-purple-100'
              }`}
            >
              Locations ({locations.length})
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                activeTab === 'graph' ? 'bg-[#6A1B9A] text-white shadow-md' : 'bg-purple-50 text-[#6A1B9A] hover:bg-purple-100'
              }`}
            >
              Graph Nodes ({PATH_NODES.length})
            </button>
            <button
              onClick={handleLogout}
              title="Lock Admin Portal"
              className="p-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* LIVE 3D POSITION & ROTATION EDITOR TAB */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Viewport Preview (Col-span 2) */}
            <div className="lg:col-span-2 bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden h-[540px] relative">
              <CampusScene
                locations={locations}
                selectedLocation={selectedLoc}
                onSelectLocation={handleSelectBuildingToEdit}
                activeRoute={null}
                startLocation={null}
                destinationLocation={null}
                showLabels={true}
                showRoads={true}
                controlsRef={{ current: null }}
              />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-purple-200 text-xs font-bold text-[#6A1B9A] flex items-center gap-2 shadow-md">
                <Compass className="w-4 h-4 text-[#D97706]" />
                Live 3D Preview (Click building to rotate/move)
              </div>
            </div>

            {/* Real-time Controls & Rotation Slider Panel */}
            <div className="bg-white p-5 rounded-3xl border border-purple-100 shadow-xl space-y-4 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="text-sm font-black text-[#6A1B9A] flex items-center justify-between">
                  <span>Building Rotation & Coordinates</span>
                  <span className="text-xs bg-[#6A1B9A] px-2.5 py-0.5 rounded-full text-white font-mono">
                    {selectedLoc?.id}
                  </span>
                </h3>

                {/* Select Building Dropdown */}
                <div>
                  <label className="block text-xs font-extrabold text-[#6A7282] uppercase mb-1">Building / Landmark</label>
                  <select
                    value={selectedLocId}
                    onChange={(e) => {
                      const loc = locations.find(l => l.id === e.target.value);
                      if (loc) handleSelectBuildingToEdit(loc);
                    }}
                    className="w-full py-2.5 px-3 bg-[#FAFAFA] border border-purple-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#6A1B9A]"
                  >
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Building Rotation Y Slider (0° to 360°) */}
                <div className="bg-purple-50/80 p-3 rounded-2xl border border-purple-100 space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#6A1B9A]">
                    <span className="flex items-center gap-1.5 text-[#D97706]">
                      <RotateCw className="w-3.5 h-3.5" />
                      Rotate Building (Y Angle)
                    </span>
                    <span className="font-mono text-[#D97706]">{rotY}°</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={360}
                    step={5}
                    value={rotY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setRotY(val);
                      onUpdateLocation({ ...selectedLoc, rotationY: val });
                    }}
                    className="w-full accent-[#6A1B9A] cursor-pointer"
                  />
                </div>

                {/* 3D X Position Slider (-300m to +300m) */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#6A7282] mb-1">
                    <span>3D Position X (West ↔ East)</span>
                    <span className="text-[#6A1B9A] font-mono">{posX} m</span>
                  </div>
                  <input
                    type="range"
                    min={-300}
                    max={300}
                    step={1}
                    value={posX}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPosX(val);
                      onUpdateLocation({ ...selectedLoc, position: { ...selectedLoc.position, x: val } });
                    }}
                    className="w-full accent-[#6A1B9A] cursor-pointer"
                  />
                </div>

                {/* 3D Z Position Slider (-300m to +300m) */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#6A7282] mb-1">
                    <span>3D Position Z (North ↔ South)</span>
                    <span className="text-[#6A1B9A] font-mono">{posZ} m</span>
                  </div>
                  <input
                    type="range"
                    min={-300}
                    max={300}
                    step={1}
                    value={posZ}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPosZ(val);
                      onUpdateLocation({ ...selectedLoc, position: { ...selectedLoc.position, z: val } });
                    }}
                    className="w-full accent-[#6A1B9A] cursor-pointer"
                  />
                </div>

                {/* Height Elevation Y Slider (0m to 20m) */}
                <div>
                  <div className="flex justify-between text-xs font-bold text-[#6A7282] mb-1">
                    <span>Elevation Y (Height)</span>
                    <span className="text-[#6A1B9A] font-mono">{posY} m</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={20}
                    step={0.5}
                    value={posY}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setPosY(val);
                      onUpdateLocation({ ...selectedLoc, position: { ...selectedLoc.position, y: val } });
                    }}
                    className="w-full accent-[#6A1B9A] cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Footer */}
              <div className="pt-3 border-t border-purple-100 space-y-2">
                <button
                  onClick={handleSaveCurrentLocation}
                  className="w-full py-2.5 bg-[#6A1B9A] hover:bg-purple-800 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  Save Building Location & Rotation
                </button>

                <button
                  onClick={handleCopyTsCode}
                  className="w-full py-2 bg-[#FAFAFA] hover:bg-purple-50 text-[#6A1B9A] font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-purple-200 transition-colors"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied Dataset Code!' : 'Copy recCampusData.ts Code'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOCATIONS LIST TAB */}
        {activeTab === 'locations' && (
          <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <h3 className="text-base font-black text-[#6A1B9A] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#D97706]" />
                All Verified REC 3D Buildings & Landmarks ({locations.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {locations.map(loc => (
                <div key={loc.id} className="p-4 bg-[#FAFAFA] rounded-2xl border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-[#6A1B9A]">{loc.name}</h4>
                    <span className="text-[10px] bg-[#6A1B9A] px-2 py-0.5 rounded-full font-bold uppercase text-white">
                      {loc.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#6A7282] line-clamp-2">{loc.description}</p>
                  <p className="text-[11px] font-mono text-[#D97706] font-bold">
                    Pos: ({loc.position.x}m, {loc.position.y}m, {loc.position.z}m) | RotY: {loc.rotationY || 0}°
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PATH GRAPH OVERVIEW TAB */}
        {activeTab === 'graph' && (
          <div className="bg-white border border-purple-100 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-base font-black text-[#6A1B9A] flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#D97706]" />
              3D Navigation Road Graph Definition ({PATH_NODES.length} Nodes & {PATH_EDGES.length} Edges)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-purple-100 bg-[#FAFAFA] rounded-2xl p-4 max-h-96 overflow-y-auto">
                <h4 className="text-xs font-extrabold text-[#6A1B9A] uppercase mb-2">3D Graph Nodes</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {PATH_NODES.map(node => (
                    <div key={node.id} className="p-2 bg-white rounded border border-purple-100 flex justify-between text-slate-800">
                      <span>{node.name} (<span className="text-[#D97706] font-bold">{node.id}</span>)</span>
                      <span className="text-[#6A7282]">({node.position.x}m, {node.position.z}m)</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border border-purple-100 bg-[#FAFAFA] rounded-2xl p-4 max-h-96 overflow-y-auto">
                <h4 className="text-xs font-extrabold text-[#6A1B9A] uppercase mb-2">Graph Edges (Road Segments)</h4>
                <div className="space-y-1.5 text-xs font-mono">
                  {PATH_EDGES.map(edge => (
                    <div key={edge.id} className="p-2 bg-white rounded border border-purple-100 flex justify-between text-slate-800">
                      <span>{edge.roadName || 'Road'}: {edge.from} ↔ {edge.to}</span>
                      <span className="text-[#D97706] font-bold">{edge.distance}m</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
