import React, { useState, useRef, useEffect } from 'react';
import type { Location } from '../../types';
import { Search, X, MapPin, ArrowRight } from 'lucide-react';

interface SearchBarProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  locations,
  onSelectLocation,
  placeholder = 'Search buildings, departments, cafes (e.g. CSE, Block A, Cafe)...',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search Filter supporting Exact, Partial, Case-Insensitive, Tags, & Aliases
  const filteredLocations = query.trim() === '' ? [] : locations.filter(loc => {
    const q = query.toLowerCase().trim();
    const matchName = loc.name.toLowerCase().includes(q);
    const matchCat = loc.category.toLowerCase().includes(q);
    const matchTags = loc.tags?.some(tag => tag.toLowerCase().includes(q));
    const matchAliases = loc.aliases?.some(alias => alias.toLowerCase().includes(q));
    const matchFacilities = loc.facilities?.some(fac => fac.toLowerCase().includes(q));
    return matchName || matchCat || matchTags || matchAliases || matchFacilities;
  });

  return (
    <div ref={dropdownRef} className="relative w-full max-w-xl">
      {/* Search Input Container */}
      <div className="relative flex items-center bg-white rounded-xl shadow-lg border border-slate-200/80 focus-within:ring-2 focus-within:ring-rec-blue transition-all">
        <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full py-3 px-3 text-sm text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none font-medium"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="p-1.5 mr-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Auto-complete Dropdown Results */}
      {isOpen && query.trim() !== '' && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredLocations.length > 0 ? (
            filteredLocations.map(loc => (
              <div
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc);
                  setQuery(loc.name);
                  setIsOpen(false);
                }}
                className="p-3.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between group transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rec-blue/10 text-rec-blue flex items-center justify-center shrink-0 group-hover:bg-rec-blue group-hover:text-white transition-colors">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 group-hover:text-rec-blue transition-colors">
                      {loc.name}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {loc.description || loc.category}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-500 text-sm">
              <p className="font-semibold text-slate-700">No locations found</p>
              <p className="text-xs text-slate-400 mt-1">Try searching "Block A", "CSE", "Cafe", or "Hostel"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
