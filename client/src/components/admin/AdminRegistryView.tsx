import React, { useState, useMemo } from 'react';
import type { Location, CategoryId } from '../../types';
import { CATEGORIES } from '../../data/recCampusData';
import { CAMPUS_GLB_MODELS } from '../../data/assetManifest';
import {
  Search,
  X,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  Building,
  Eye,
  BookOpen,
  Tag,
  CheckCircle2,
  Compass,
} from 'lucide-react';

interface AdminRegistryViewProps {
  locations: Location[];
  selectedBuildingId: string;
  onSelectBuilding: (id: string) => void;
  onUpdateLocation: (updatedLoc: Location) => void;
  onAddLocation: (newLoc: Location) => void;
  onDeleteLocation: (id: string) => void;
  onSwitchToCadStudio: (buildingId?: string) => void;
}

// Curated stock photos for campus facility categories
const PHOTO_PRESETS = [
  {
    label: 'Academic (Modern Block)',
    category: 'academic',
    url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Engineering / Labs',
    category: 'academic',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Library / Administrative',
    category: 'admin',
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Central Cafeteria / Food',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Student Cafe / Plaza',
    category: 'food',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Hostel Complex / Dorms',
    category: 'hostel',
    url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Hostel Dining Mess',
    category: 'hostel',
    url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Indoor Auditorium',
    category: 'sports',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Sports Stadium & Courts',
    category: 'sports',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Swimming Pool & Arch',
    category: 'sports',
    url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Campus Main Entrance Gate',
    category: 'entrance',
    url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Student Parking Area',
    category: 'parking',
    url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
  },
];

// Common facility suggestions to add in one click
const SUGGESTED_FACILITIES = [
  'Air Conditioned',
  'High-Speed Wi-Fi',
  'Smart Classrooms',
  'Elevator / Lift',
  'RO Drinking Water',
  'Restrooms',
  'Projector & Audio',
  '24/7 Security',
  'CCTV Surveillance',
  'Parking Available',
  'Fire Safety & Exits',
  'Wheelchair Accessible',
];

export const AdminRegistryView: React.FC<AdminRegistryViewProps> = ({
  locations,
  selectedBuildingId,
  onSelectBuilding,
  onUpdateLocation,
  onAddLocation,
  onDeleteLocation,
  onSwitchToCadStudio,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [newFacilityInput, setNewFacilityInput] = useState('');
  const [newAliasInput, setNewAliasInput] = useState('');
  const [saveToast, setSaveToast] = useState('');
  const [imageError, setImageError] = useState(false);

  // Selected building object
  const currentBuilding = useMemo(() => {
    return locations.find(l => l.id === selectedBuildingId) || locations[0] || null;
  }, [locations, selectedBuildingId]);

  // Filtered building list for the directory sidebar
  const filteredBuildings = useMemo(() => {
    return locations.filter(loc => {
      const matchesSearch =
        loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (loc.description && loc.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (loc.tags && loc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) ||
        (loc.aliases && loc.aliases.some(a => a.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesCat = categoryFilter === 'all' || loc.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [locations, searchQuery, categoryFilter]);

  // Update a single property on the currently selected building
  const handleUpdate = <K extends keyof Location>(key: K, value: Location[K]) => {
    if (!currentBuilding) return;
    const updated: Location = { ...currentBuilding, [key]: value };
    onUpdateLocation(updated);
    setSaveToast(`Updated ${String(key)} for ${currentBuilding.name}`);
    setTimeout(() => setSaveToast(''), 2500);
  };

  // Add facility chip
  const handleAddFacility = (fac: string) => {
    if (!currentBuilding || !fac.trim()) return;
    const existing = currentBuilding.facilities || [];
    if (existing.includes(fac.trim())) return;
    handleUpdate('facilities', [...existing, fac.trim()]);
    setNewFacilityInput('');
  };

  // Remove facility chip
  const handleRemoveFacility = (facToRemove: string) => {
    if (!currentBuilding) return;
    const existing = currentBuilding.facilities || [];
    handleUpdate('facilities', existing.filter(f => f !== facToRemove));
  };

  // Add alias chip
  const handleAddAlias = (alias: string) => {
    if (!currentBuilding || !alias.trim()) return;
    const existing = currentBuilding.aliases || [];
    if (existing.includes(alias.trim())) return;
    handleUpdate('aliases', [...existing, alias.trim()]);
    setNewAliasInput('');
  };

  // Remove alias chip
  const handleRemoveAlias = (aliasToRemove: string) => {
    if (!currentBuilding) return;
    const existing = currentBuilding.aliases || [];
    handleUpdate('aliases', existing.filter(a => a !== aliasToRemove));
  };

  // Quick preset photo select
  const handleSelectPresetPhoto = (url: string) => {
    setImageError(false);
    handleUpdate('image', url);
  };

  // Create new place in registry
  const handleCreatePlace = () => {
    const newId = `building_${Date.now().toString().slice(-4)}`;
    const newPlace: Location = {
      id: newId,
      name: 'New Campus Place',
      category: 'academic',
      description: 'Campus facility structure at Rajalakshmi Engineering College.',
      image: PHOTO_PRESETS[0].url,
      position: { x: 0, y: 0, z: 0 },
      rotationY: 0,
      scale: [1, 1, 1],
      modelKey: CAMPUS_GLB_MODELS[0]?.id || 'block-a-optimized.glb',
      nodeId: `node_${newId}_entrance`,
      facilities: ['High-Speed Wi-Fi', 'Smart Classrooms'],
      tags: ['campus', 'facility'],
      aliases: ['New Place'],
    };
    onAddLocation(newPlace);
    onSelectBuilding(newPlace.id);
  };

  const currentCategoryObj = CATEGORIES.find(c => c.id === currentBuilding?.category);

  return (
    <div className="flex-1 w-full h-[calc(100vh-65px)] bg-slate-100 dark:bg-[#080B11] text-slate-900 dark:text-white flex flex-col overflow-hidden select-none transition-colors duration-300">
      {/* 1. TOP REGISTRY HEADER BANNER */}
      <div className="px-6 py-4 bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200/90 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-4 shrink-0 z-20">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-200 dark:border-purple-800/60 font-mono">
              CAMPUS REGISTRY
            </span>
            <span className="text-[10px] font-bold text-slate-400">•</span>
            <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
              {locations.length} Facilities Registered
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5 flex items-center gap-2">
            <span>Places Directory & Media Manager</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl">
            Edit building photos, detailed descriptions, amenities, and aliases displayed to visitors and students on the public Places page.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSwitchToCadStudio(currentBuilding?.id)}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
            title="Open in 3D CAD Studio to edit position and entrances"
          >
            <Compass className="w-4 h-4 text-amber-500" />
            <span>Open in 3D CAD Studio</span>
          </button>

          <button
            onClick={handleCreatePlace}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Building</span>
          </button>
        </div>
      </div>

      {/* Save Toast Feedback */}
      {saveToast && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-950/95 border border-emerald-500 text-emerald-200 px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* 2. MAIN REGISTRY WORKSPACE (TWO-COLUMN RESPONSIVE LAYOUT) */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: BUILDINGS DIRECTORY LIST */}
        <aside className="w-80 sm:w-96 border-r border-slate-200/90 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/50 backdrop-blur-xl flex flex-col shrink-0 overflow-hidden">
          {/* Search & Category Filter */}
          <div className="p-3 border-b border-slate-200/80 dark:border-slate-800/80 space-y-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search places by name or keyword..."
                className="w-full pl-8.5 pr-8 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-[10px]">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all ${
                  categoryFilter === 'all'
                    ? 'bg-purple-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All ({locations.length})
              </button>
              {CATEGORIES.map(cat => {
                const count = locations.filter(l => l.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 ${
                      categoryFilter === cat.id
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat.name.split(' ')[0]}</span>
                    <span className="text-[9px] opacity-70">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Place Cards List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {filteredBuildings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <p>No places found matching your filter.</p>
                <button
                  onClick={handleCreatePlace}
                  className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Place</span>
                </button>
              </div>
            ) : (
              filteredBuildings.map(loc => {
                const isSelected = currentBuilding?.id === loc.id;
                const cat = CATEGORIES.find(c => c.id === loc.category);
                const hasPhoto = Boolean(loc.image && loc.image.trim().length > 5);
                const hasDesc = Boolean(loc.description && loc.description.trim().length > 5);

                return (
                  <div
                    key={loc.id}
                    onClick={() => {
                      onSelectBuilding(loc.id);
                      setImageError(false);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-400 dark:border-purple-500/60 shadow-md ring-1 ring-purple-400/40 text-purple-950 dark:text-purple-100'
                        : 'bg-white/80 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900/80 border-slate-200/80 dark:border-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 relative border border-slate-200 dark:border-slate-800">
                      {hasPhoto ? (
                        <img
                          src={loc.image}
                          alt={loc.name}
                          className="w-full h-full object-cover"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                          <ImageIcon className="w-5 h-5 opacity-40" />
                          <span className="text-[8px] font-mono mt-0.5">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: cat?.color || '#9333EA' }}
                        />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {loc.name}
                        </h4>
                      </div>

                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {hasDesc ? loc.description : 'No description set'}
                      </p>

                      <div className="flex items-center gap-2 mt-1 text-[9px] font-mono text-slate-400">
                        <span className="capitalize text-slate-600 dark:text-slate-300 font-bold">
                          {cat?.name?.split(' ')[0] || loc.category}
                        </span>
                        <span>•</span>
                        {hasPhoto ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">📷 Photo Set</span>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 font-bold">⚠️ Needs Photo</span>
                        )}
                        {loc.facilities && loc.facilities.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{loc.facilities.length} tags</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: RICH PLACE EDITOR & LIVE CARD PREVIEW */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {currentBuilding ? (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header card with quick actions */}
              <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      style={{ backgroundColor: currentCategoryObj?.color || '#9333EA' }}
                      className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-sm"
                    >
                      {currentCategoryObj?.name || currentBuilding.category}
                    </span>
                    <span className="text-xs font-mono text-slate-400">ID: {currentBuilding.id}</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white truncate mt-1">
                    {currentBuilding.name}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSwitchToCadStudio(currentBuilding.id)}
                    className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>View in 3D Map</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Delete place "${currentBuilding.name}" from campus registry?`)) {
                        onDeleteLocation(currentBuilding.id);
                      }
                    }}
                    className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900"
                    title="Delete Place"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* SECTION A: PHOTO & MEDIA MANAGEMENT (CRITICAL USER REQUEST) */}
              <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      1. Building Photo & Media
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Displayed on Places Page & 3D HUD
                  </span>
                </div>

                {/* Photo Preview & URL input */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Photo Preview Card */}
                  <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 h-56 flex flex-col items-center justify-center shadow-inner">
                    {currentBuilding.image && !imageError ? (
                      <>
                        <img
                          src={currentBuilding.image}
                          alt={currentBuilding.name}
                          className="w-full h-full object-cover"
                          onError={() => setImageError(true)}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />
                        <span className="absolute bottom-2.5 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
                          Live Photo Preview
                        </span>
                        <button
                          onClick={() => handleUpdate('image', '')}
                          className="absolute top-2.5 right-2.5 px-2 py-1 bg-red-600/80 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold shadow cursor-pointer transition-all"
                        >
                          Remove Photo
                        </button>
                      </>
                    ) : (
                      <div className="text-center p-6 space-y-2">
                        <ImageIcon className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {imageError ? '⚠️ Image URL failed to load' : 'No photo uploaded yet'}
                        </p>
                        <p className="text-[10px] text-slate-400 max-w-xs">
                          Paste a direct image URL below or pick one of the sample campus presets.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Image URL Input & Presets */}
                  <div className="space-y-3 flex flex-col justify-between">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1.5">
                        Direct Image URL
                      </label>
                      <input
                        type="text"
                        value={currentBuilding.image || ''}
                        onChange={e => {
                          setImageError(false);
                          handleUpdate('image', e.target.value);
                        }}
                        placeholder="https://images.unsplash.com/... or /assets/..."
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Accepts any public web image (Unsplash, Imgur, college portal) or local path.
                      </p>
                    </div>

                    {/* Quick Preset Selector */}
                    <div>
                      <label className="block text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Quick Presets by Facility Type:</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                        {PHOTO_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectPresetPhoto(preset.url)}
                            className="text-left px-2 py-1 rounded-lg hover:bg-white dark:hover:bg-slate-900 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate cursor-pointer transition-all"
                            title={preset.url}
                          >
                            📷 {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION B: PLACES CARD DESCRIPTION & DETAILS (CRITICAL USER REQUEST) */}
              <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      2. Places Card Description & Identity
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Public Directory Copy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Place / Building Name
                    </label>
                    <input
                      type="text"
                      value={currentBuilding.name}
                      onChange={e => handleUpdate('name', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                      Sector Category
                    </label>
                    <select
                      value={currentBuilding.category}
                      onChange={e => handleUpdate('category', e.target.value as CategoryId)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description Textarea */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    <span>Places Page Description</span>
                    <span className="text-[10px] font-mono font-normal text-slate-400">
                      {currentBuilding.description?.length || 0} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={currentBuilding.description || ''}
                    onChange={e => handleUpdate('description', e.target.value)}
                    placeholder="Provide a detailed, helpful summary of this building, departments housed, facilities available, and key campus functions..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    This text is featured on the Places page cards and in the 3D Map Inspector panel when clicked by users.
                  </p>
                </div>
              </div>

              {/* SECTION C: FACILITIES & AMENITIES TAGS */}
              <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      3. Facilities & Amenities ({currentBuilding.facilities?.length || 0})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Feature Badges on Cards
                  </span>
                </div>

                {/* Current Active Facilities Chips */}
                <div className="flex flex-wrap gap-2">
                  {currentBuilding.facilities && currentBuilding.facilities.length > 0 ? (
                    currentBuilding.facilities.map((fac, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                      >
                        <span>✓ {fac}</span>
                        <button
                          onClick={() => handleRemoveFacility(fac)}
                          className="hover:text-red-500 dark:hover:text-red-400 cursor-pointer ml-0.5"
                          title="Remove facility"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No amenities specified yet.</span>
                  )}
                </div>

                {/* Add Custom Facility Input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFacilityInput}
                    onChange={e => setNewFacilityInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFacility(newFacilityInput);
                      }
                    }}
                    placeholder="Type custom amenity (e.g. Solar Power, Conference Hall)..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={() => handleAddFacility(newFacilityInput)}
                    disabled={!newFacilityInput.trim()}
                    className="px-3.5 py-1.5 bg-emerald-600 disabled:opacity-40 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                  >
                    Add Amenity
                  </button>
                </div>

                {/* One-click suggestions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Quick-Add Common Amenities:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SUGGESTED_FACILITIES.filter(
                      f => !(currentBuilding.facilities || []).includes(f)
                    ).map((fac, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAddFacility(fac)}
                        className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-700 rounded-md text-[10px] font-semibold cursor-pointer transition-all"
                      >
                        + {fac}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION D: SEARCH ALIASES & KEYWORDS */}
              <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      4. Search Keywords & Aliases
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    Powers Smart Search
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentBuilding.aliases && currentBuilding.aliases.length > 0 ? (
                    currentBuilding.aliases.map((alias, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5"
                      >
                        <span>#{alias}</span>
                        <button
                          onClick={() => handleRemoveAlias(alias)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No search aliases set.</span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAliasInput}
                    onChange={e => setNewAliasInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddAlias(newAliasInput);
                      }
                    }}
                    placeholder="Add search alias (e.g. CSE, Canteen, Block 1)..."
                    className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => handleAddAlias(newAliasInput)}
                    disabled={!newAliasInput.trim()}
                    className="px-3.5 py-1.5 bg-amber-600 disabled:opacity-40 hover:bg-amber-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                  >
                    Add Alias
                  </button>
                </div>
              </div>

              {/* SECTION E: EXACT PLACES PAGE LIVE CARD PREVIEW */}
              <div className="bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 border-2 border-purple-400/40 dark:border-purple-500/30 rounded-2xl p-5 shadow-lg space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h4 className="font-black text-xs text-slate-900 dark:text-white uppercase tracking-wider">
                      Live Preview — Public Places Page Card
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                    Exactly as shown on /places
                  </span>
                </div>

                {/* 1:1 Rendering of the actual Places Card */}
                <div className="max-w-sm mx-auto bg-white/95 dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xl overflow-hidden flex flex-col">
                  {/* Visual Header / Cover */}
                  <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={
                        currentBuilding.image ||
                        'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={currentBuilding.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Category Pill */}
                    <span
                      style={{ backgroundColor: currentCategoryObj?.color || '#9333EA' }}
                      className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-md"
                    >
                      {currentCategoryObj?.name || currentBuilding.category}
                    </span>

                    {/* Coordinate Tag */}
                    <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-sm text-[10px] font-mono text-amber-300 border border-slate-700">
                      [{Math.round(currentBuilding.position.x)}, {Math.round(currentBuilding.position.z)}]
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">
                        {currentBuilding.name}
                      </h3>
                      {currentBuilding.entrances && currentBuilding.entrances.length > 0 && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                          {currentBuilding.entrances.length} Entrances
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {currentBuilding.description || 'Campus facility at Rajalakshmi Engineering College.'}
                    </p>

                    {/* Facilities Preview */}
                    {currentBuilding.facilities && currentBuilding.facilities.length > 0 && (
                      <div className="space-y-1 pt-1">
                        {currentBuilding.facilities.slice(0, 2).map((fac, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-medium"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            <span className="truncate">{fac}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-400 space-y-3">
              <Building className="w-12 h-12 mx-auto opacity-30" />
              <p className="text-sm font-bold">Select a place from the directory to edit its photo and description.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
