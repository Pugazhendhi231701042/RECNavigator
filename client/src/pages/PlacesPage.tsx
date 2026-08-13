import React, { useState } from 'react';
import type { Location, CategoryId } from '../types';
import { CATEGORIES } from '../data/recCampusData';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { Navigation, Compass, CheckCircle2, Search } from 'lucide-react';

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

  const filteredLocations = locations.filter(loc => {
    const matchesCat = selectedCategory === 'all' || loc.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = q === '' || (
      loc.name.toLowerCase().includes(q) ||
      loc.description?.toLowerCase().includes(q) ||
      loc.tags?.some(t => t.toLowerCase().includes(q)) ||
      loc.aliases?.some(a => a.toLowerCase().includes(q))
    );
    return matchesCat && matchesSearch;
  });

  return (
    <div className="w-full h-[calc(100vh-65px)] overflow-y-auto bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Directory Title Banner */}
        <div className="bg-gradient-to-r from-rec-blue via-blue-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rec-gold/10 rounded-full blur-3xl" />
          <div className="relative space-y-2">
            <span className="text-xs font-bold text-rec-gold uppercase tracking-wider bg-rec-gold/10 px-3 py-1 rounded-full border border-rec-gold/20">
              Campus Directory ({locations.length} Locations)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Explore REC Places & Buildings</h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Browse all academic blocks, engineering departments, eating spots, hostels, and sports facilities at Rajalakshmi Engineering College.
            </p>

            {/* Search Input */}
            <div className="pt-3 max-w-md relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places by name, department, tag (e.g. CSE, Cafe)..."
                className="w-full py-2.5 pl-10 pr-4 bg-slate-800/90 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rec-blue transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLocations.map(loc => {
            const categoryObj = CATEGORIES.find(c => c.id === loc.category);
            return (
              <div
                key={loc.id}
                className="bg-slate-800/90 rounded-2xl border border-slate-700/80 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                  <img
                    src={loc.image || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  
                  <span
                    style={{ backgroundColor: categoryObj?.color || '#2563EB' }}
                    className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-md"
                  >
                    {categoryObj?.name || loc.category}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-3">
                  <h3 className="text-base font-bold text-white group-hover:text-rec-gold transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {loc.description}
                  </p>

                  {loc.facilities && loc.facilities.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {loc.facilities.slice(0, 2).map((fac, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="line-clamp-1">{fac}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-slate-900 border-t border-slate-700/80 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectLocation(loc);
                      onNavigateToMap();
                    }}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-rec-gold" />
                    View 3D Map
                  </button>
                  <button
                    onClick={() => {
                      onSetAsDestination(loc);
                      onNavigateToMap();
                    }}
                    className="flex-1 py-2 px-3 bg-rec-blue hover:bg-rec-blue-dark text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md transition-colors"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Directions
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
