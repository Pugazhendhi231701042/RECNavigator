import React, { useState } from 'react';
import type { Location, CategoryId } from '../types';
import { CATEGORIES } from '../data/recCampusData';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { Navigation, Compass, CheckCircle2 } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Directory Title Banner */}
      <div className="bg-gradient-to-r from-rec-blue to-rec-blue-dark text-white p-6 rounded-3xl shadow-xl">
        <h2 className="text-2xl font-black tracking-tight">Campus Directory & Places</h2>
        <p className="text-sm text-blue-200 mt-1">
          Browse all buildings, departments, eating spots, hostels, and sports facilities at Rajalakshmi Engineering College.
        </p>

        {/* Search Bar */}
        <div className="mt-4 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search places by name, department, tag (e.g. CSE, Cafe)..."
            className="w-full py-2.5 px-4 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-blue-200 focus:outline-none focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 transition-all"
          />
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
              className="bg-white rounded-2xl border border-slate-200/80 shadow-card hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Image Banner */}
              <div className="relative h-44 w-full bg-slate-800 overflow-hidden">
                <img
                  src={loc.image || 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=800&q=80'}
                  alt={loc.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                <span
                  style={{ backgroundColor: categoryObj?.color || '#2563EB' }}
                  className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white uppercase tracking-wider shadow-md"
                >
                  {categoryObj?.name || loc.category}
                </span>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 space-y-3">
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-rec-blue transition-colors">
                  {loc.name}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {loc.description}
                </p>

                {loc.facilities && loc.facilities.length > 0 && (
                  <div className="space-y-1">
                    {loc.facilities.slice(0, 2).map((fac, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="line-clamp-1">{fac}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => {
                    onSelectLocation(loc);
                    onNavigateToMap();
                  }}
                  className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-rec-blue" />
                  View on Map
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
  );
};
