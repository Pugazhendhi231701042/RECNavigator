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
    <div className="w-full h-[calc(100vh-65px)] overflow-y-auto bg-[#FAFAFA] text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-32">
        {/* Directory Title Banner */}
        <div className="bg-gradient-to-r from-[#6A1B9A] via-purple-700 to-[#4A148C] text-white p-6 sm:p-8 rounded-3xl border border-purple-300 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="relative space-y-2">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
              Campus Directory ({locations.length} Locations)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">Explore REC Places & Buildings</h2>
            <p className="text-xs sm:text-sm text-purple-100 max-w-2xl">
              Browse all academic blocks, engineering departments, eating spots, hostels, and sports facilities at Rajalakshmi Engineering College.
            </p>

            {/* Search Input */}
            <div className="pt-3 max-w-md relative">
              <Search className="w-4 h-4 text-purple-300 absolute left-3.5 top-6" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search places by name, department, tag (e.g. CSE, Cafe)..."
                className="w-full py-2.5 pl-10 pr-4 bg-white/15 border border-white/20 rounded-xl text-xs sm:text-sm text-white placeholder-purple-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
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
                className="bg-white rounded-2xl border border-purple-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group hover:-translate-y-1"
              >
                {/* Image Banner */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={loc.image || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
                    alt={loc.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  <span
                    style={{ backgroundColor: categoryObj?.color || '#6A1B9A' }}
                    className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-md"
                  >
                    {categoryObj?.name || loc.category}
                  </span>
                </div>

                {/* Body Content */}
                <div className="p-5 flex-1 space-y-3">
                  <h3 className="text-base font-extrabold text-[#6A1B9A] group-hover:text-purple-900 transition-colors">
                    {loc.name}
                  </h3>
                  <p className="text-xs text-[#6A7282] line-clamp-2 leading-relaxed">
                    {loc.description}
                  </p>

                  {loc.facilities && loc.facilities.length > 0 && (
                    <div className="space-y-1 pt-1">
                      {loc.facilities.slice(0, 2).map((fac, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                          <span className="line-clamp-1">{fac}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-[#FAFAFA] border-t border-purple-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectLocation(loc);
                      onNavigateToMap();
                    }}
                    className="flex-1 py-2 px-3 bg-white hover:bg-purple-50 text-[#6A1B9A] border border-purple-200 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#D97706]" />
                    View 3D Map
                  </button>
                  <button
                    onClick={() => {
                      onSetAsDestination(loc);
                      onNavigateToMap();
                    }}
                    className="flex-1 py-2 px-3 bg-[#6A1B9A] hover:bg-purple-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition-colors"
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
