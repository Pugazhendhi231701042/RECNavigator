import React, { useState, useMemo } from 'react';
import type { Location, CategoryId } from '../types';
import { CATEGORIES } from '../data/recCampusData';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { Navigation, Compass, CheckCircle2, Search, X, Building2 } from 'lucide-react';

interface PlacesPageProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
  onNavigateToMap: () => void;
  onSetAsDestination: (loc: Location) => void;
}

export const PlacesPage: React.FC<PlacesPageProps> = ({
  locations,
  onSelectLocation,
  onNavigateToMap,
  onSetAsDestination,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesCat = selectedCategory === 'all' || loc.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        loc.name.toLowerCase().includes(q) ||
        (loc.block && loc.block.toLowerCase().includes(q)) ||
        loc.description?.toLowerCase().includes(q) ||
        loc.tags?.some((t) => t.toLowerCase().includes(q)) ||
        loc.aliases?.some((a) => a.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [locations, selectedCategory, searchQuery]);

  return (
    <div className="w-full min-h-full bg-slate-100/70 dark:bg-[#080B11] text-slate-900 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 pb-32">
        {/* TOP CAD EXPLORER BANNER */}
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-xl space-y-4">
          {/* Subtle Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 px-3 py-1 rounded-full font-mono">
                SPATIAL DIRECTORY • {locations.length} LOCATIONS INDEXED
              </span>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Rajalakshmi Engineering College (REC)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Campus Facilities & Spatial Registry
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              Explore academic departments, engineering laboratories, student dining halls, hostels, and sports facilities with coordinate precision and multi-entrance navigation.
            </p>

            {/* Quick Search Bar */}
            <div className="pt-2 max-w-lg relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-5.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, block, department, or keyword (e.g. CSE, Cafe)..."
                className="w-full py-3 pl-10 pr-9 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Category Pills Filter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
              Filter by Department / Sector
            </span>
            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
              {filteredLocations.length} Matching
            </span>
          </div>
          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* CAD Place Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map((loc) => {
            const categoryObj = CATEGORIES.find((c) => c.id === loc.category);
            const entranceCount = loc.entrances?.length || 0;

            return (
              <div
                key={loc.id}
                className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-md hover:shadow-2xl hover:border-purple-500/50 transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Visual Header / Cover */}
                <div className="relative h-44 w-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={
                      loc.image ||
                      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                  {/* Category Pill */}
                  <span
                    style={{ backgroundColor: categoryObj?.color || '#9333EA' }}
                    className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-black text-white uppercase tracking-wider shadow-md"
                  >
                    {categoryObj?.name || loc.category}
                  </span>

                  {/* Coordinate Tag */}
                  <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-sm text-[10px] font-mono text-amber-300 border border-slate-700">
                    [{Math.round(loc.position.x)}, {Math.round(loc.position.z)}]
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {loc.name}
                    </h3>
                    {entranceCount > 0 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                        {entranceCount} Entrances
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {loc.description || 'Campus facility at Rajalakshmi Engineering College.'}
                  </p>

                  {/* Facilities List */}
                  {loc.facilities && loc.facilities.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {loc.facilities.slice(0, 2).map((fac, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="line-clamp-1">{fac}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-3.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectLocation(loc);
                      onNavigateToMap();
                    }}
                    className="flex-1 py-2 px-3 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-98 cursor-pointer"
                  >
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    Inspect in 3D
                  </button>

                  <button
                    onClick={() => {
                      onSetAsDestination(loc);
                      onNavigateToMap();
                    }}
                    className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-98 cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Route Here
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredLocations.length === 0 && (
          <div className="p-12 text-center bg-white/80 dark:bg-slate-900/80 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <Building2 className="w-12 h-12 mx-auto opacity-30 text-purple-400" />
            <h3 className="text-base font-black">No Locations Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Try changing the search query or selecting a different department category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
