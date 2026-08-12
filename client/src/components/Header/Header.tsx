import React from 'react';
import type { Location } from '../../types';
import { SearchBar } from '../SearchBar/SearchBar';
import { Compass, Navigation, Grid, Info, ShieldCheck, Crosshair } from 'lucide-react';

interface HeaderProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
  activeTab: 'map' | 'directions' | 'places' | 'about' | 'admin';
  onChangeTab: (tab: 'map' | 'directions' | 'places' | 'about' | 'admin') => void;
  onLocateUser: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  locations,
  onSelectLocation,
  activeTab,
  onChangeTab,
  onLocateUser,
}) => {
  return (
    <header className="bg-rec-blue text-white shadow-lg sticky top-0 z-40 border-b border-rec-blue-dark">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onChangeTab('map')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-rec-gold text-slate-900 font-extrabold flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            REC
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
              WayFinder
              <span className="text-[10px] bg-rec-gold/20 text-rec-gold font-bold px-2 py-0.5 rounded-full border border-rec-gold/30">
                REC CHENNAI
              </span>
            </h1>
            <p className="text-[11px] text-blue-200 font-medium mt-0.5">
              Rajalakshmi Engineering College
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-lg mx-4">
          <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => onChangeTab('map')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'map' ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Compass className="w-4 h-4 text-rec-gold" />
            Explore Map
          </button>

          <button
            onClick={() => onChangeTab('directions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'directions' ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Navigation className="w-4 h-4 text-rec-gold" />
            Directions
          </button>

          <button
            onClick={() => onChangeTab('places')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'places' ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Grid className="w-4 h-4 text-rec-gold" />
            Places
          </button>

          <button
            onClick={() => onChangeTab('about')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'about' ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <Info className="w-4 h-4 text-rec-gold" />
            About
          </button>

          <button
            onClick={() => onChangeTab('admin')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
              activeTab === 'admin' ? 'bg-white/15 text-white' : 'text-blue-200 hover:text-white hover:bg-white/10'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-rec-gold" />
            Admin
          </button>
        </div>

        {/* Action Button: Locate Me */}
        <button
          onClick={onLocateUser}
          title="Detect Current Location"
          className="p-2.5 bg-rec-gold hover:bg-rec-gold-hover text-slate-900 font-bold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-all shrink-0 active:scale-95"
        >
          <Crosshair className="w-4 h-4" />
          <span className="hidden sm:inline">Locate Me</span>
        </button>
      </div>
    </header>
  );
};
