import React, { useState, useRef, useEffect } from 'react';
import type { Location } from '../../types';
import { Search, X, MapPin } from 'lucide-react';

interface SearchBarProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  locations,
  onSelectLocation,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredLocations = locations.filter(loc => {
    const q = query.toLowerCase().trim();
    if (!q) return false;
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.description?.toLowerCase().includes(q) ||
      loc.tags?.some(t => t.toLowerCase().includes(q)) ||
      loc.aliases?.some(a => a.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <Search className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-2.5" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search buildings, departments (e.g. CSE, IT, Cafe)..."
          className="w-full py-2 pl-9 pr-9 bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 shadow-inner transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLocations.map(loc => (
            <div
              key={loc.id}
              onClick={() => {
                onSelectLocation(loc);
                setQuery('');
                setIsOpen(false);
              }}
              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate">
                    {loc.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">
                    {loc.description}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-purple-600 dark:text-purple-400 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ml-2">
                {loc.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
