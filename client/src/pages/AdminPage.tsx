import React, { useState } from 'react';
import type { Location, CategoryId } from '../types';
import { PATH_NODES, PATH_EDGES } from '../data/recCampusData';
import { CampusScene } from '../components/3d/CampusScene';
import { ShieldCheck, MapPin, Save, Compass, Copy, Check, RotateCw } from 'lucide-react';

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

  // Generate copyable TypeScript dataset code for recCampusData.ts
  const generateTsCode = () => {
    return JSON.stringify(locations, null, 2);
  };

  const handleCopyTsCode = () => {
    navigator.clipboard.writeText(generateTsCode());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-24 text-white">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rec-gold text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            3D Campus Positioning & Model Rotation Editor
          </div>
          <h2 className="text-2xl font-black">Visual 3D Building Rotation & Map Alignment</h2>
          <p className="text-xs text-slate-400 mt-1">
            Rotate buildings, adjust 3D positions, toggle roads, and align models over the campus map texture.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'editor' ? 'bg-rec-blue text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Live 3D Position & Rotation Editor
          </button>
          <button
            onClick={() => setActiveTab('locations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'locations' ? 'bg-rec-blue text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Locations ({locations.length})
          </button>
          <button
            onClick={() => setActiveTab('graph')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'graph' ? 'bg-rec-blue text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Graph Nodes ({PATH_NODES.length})
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
            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-bold flex items-center gap-2">
              <Compass className="w-4 h-4 text-rec-gold" />
              Live 3D Preview (Click building to rotate/move)
            </div>
          </div>

          {/* Real-time Controls & Rotation Slider Panel */}
          <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center justify-between">
                <span>Building Rotation & Coordinates</span>
                <span className="text-xs bg-rec-blue px-2.5 py-0.5 rounded-full text-white font-mono">
                  {selectedLoc?.id}
                </span>
              </h3>

              {/* Select Building Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Building / Landmark</label>
                <select
                  value={selectedLocId}
                  onChange={(e) => {
                    const loc = locations.find(l => l.id === e.target.value);
                    if (loc) handleSelectBuildingToEdit(loc);
                  }}
                  className="w-full py-2.5 px-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-rec-blue"
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>

              {/* Building Rotation Y Slider (0° to 360°) */}
              <div className="bg-slate-800/80 p-3 rounded-2xl border border-slate-700/80 space-y-1">
                <div className="flex justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1.5 text-rec-gold">
                    <RotateCw className="w-3.5 h-3.5" />
                    Rotate Building (Y Angle)
                  </span>
                  <span className="font-mono text-rec-gold">{rotY}°</span>
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
                  className="w-full accent-rec-gold cursor-pointer"
                />
              </div>

              {/* 3D X Position Slider (-300m to +300m) */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>3D Position X (West ↔ East)</span>
                  <span className="text-slate-300 font-mono">{posX} m</span>
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
                  className="w-full accent-rec-blue cursor-pointer"
                />
              </div>

              {/* 3D Z Position Slider (-300m to +300m) */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>3D Position Z (North ↔ South)</span>
                  <span className="text-slate-300 font-mono">{posZ} m</span>
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
                  className="w-full accent-rec-blue cursor-pointer"
                />
              </div>

              {/* Height Elevation Y Slider (0m to 20m) */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-300 mb-1">
                  <span>Elevation Y (Height)</span>
                  <span className="text-slate-300 font-mono">{posY} m</span>
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
                  className="w-full accent-rec-blue cursor-pointer"
                />
              </div>
            </div>

            {/* Action Footer */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                onClick={handleSaveCurrentLocation}
                className="w-full py-2.5 bg-rec-blue hover:bg-rec-blue-dark text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Building Location & Rotation
              </button>

              <button
                onClick={handleCopyTsCode}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedCode ? 'Copied Dataset Code!' : 'Copy recCampusData.ts Code'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOCATIONS LIST TAB */}
      {activeTab === 'locations' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-rec-gold" />
              All Verified REC 3D Buildings & Landmarks ({locations.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(loc => (
              <div key={loc.id} className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/70 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{loc.name}</h4>
                  <span className="text-[10px] bg-rec-blue px-2 py-0.5 rounded-full font-bold uppercase text-white">
                    {loc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2">{loc.description}</p>
                <p className="text-[11px] font-mono text-rec-gold">
                  Pos: ({loc.position.x}m, {loc.position.y}m, {loc.position.z}m) | RotY: {loc.rotationY || 0}°
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PATH GRAPH OVERVIEW TAB */}
      {activeTab === 'graph' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-rec-blue" />
            3D Navigation Road Graph Definition ({PATH_NODES.length} Nodes & {PATH_EDGES.length} Edges)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-800 bg-slate-950 rounded-2xl p-4 max-h-96 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">3D Graph Nodes</h4>
              <div className="space-y-1.5 text-xs font-mono">
                {PATH_NODES.map(node => (
                  <div key={node.id} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>{node.name} (<span className="text-rec-gold">{node.id}</span>)</span>
                    <span className="text-slate-400">({node.position.x}m, {node.position.z}m)</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-slate-800 bg-slate-950 rounded-2xl p-4 max-h-96 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-800 uppercase mb-2">Graph Edges (Road Segments)</h4>
              <div className="space-y-1.5 text-xs font-mono">
                {PATH_EDGES.map(edge => (
                  <div key={edge.id} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <span>{edge.roadName || 'Road'}: {edge.from} ↔ {edge.to}</span>
                    <span className="text-emerald-400 font-bold">{edge.distance}m</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
