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
        <Search className="w-4 h-4 text-[#6A1B9A] absolute left-3.5 top-3" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search buildings, departments (e.g. CSE, IT, Cafe)..."
          className="w-full py-2.5 pl-10 pr-9 bg-white border border-purple-200 rounded-xl text-xs font-bold text-slate-900 placeholder-[#6A7282] focus:outline-none focus:ring-2 focus:ring-[#6A1B9A] shadow-sm transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-3 text-[#6A7282] hover:text-[#6A1B9A]"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && filteredLocations.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-2xl border border-purple-200 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto divide-y divide-purple-50">
          {filteredLocations.map(loc => (
            <div
              key={loc.id}
              onClick={() => {
                onSelectLocation(loc);
                setQuery('');
                setIsOpen(false);
              }}
              className="p-3 hover:bg-purple-50 cursor-pointer flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-purple-100 text-[#6A1B9A] flex items-center justify-center font-bold shrink-0">
                  <MapPin className="w-4 h-4 text-[#D97706]" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-[#6A1B9A] transition-colors">
                    {loc.name}
                  </h4>
                  <p className="text-[10px] text-[#6A7282] line-clamp-1">
                    {loc.description}
                  </p>
                </div>
              </div>
              <span className="text-[10px] bg-purple-100 text-[#6A1B9A] px-2 py-0.5 rounded-full font-extrabold uppercase">
                {loc.category}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
