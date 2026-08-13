import React from 'react';
import type { Location } from '../../types';
import { SearchBar } from '../SearchBar/SearchBar';
import { Compass, Grid, Info, ShieldCheck, Crosshair } from 'lucide-react';

interface HeaderProps {
  locations: Location[];
  onSelectLocation: (loc: Location) => void;
  activeTab: 'map' | 'places' | 'about' | 'admin';
  onChangeTab: (tab: 'map' | 'places' | 'about' | 'admin') => void;
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
    <header className="bg-slate-950/80 backdrop-blur-xl text-white shadow-2xl sticky top-0 z-40 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onChangeTab('map')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rec-blue via-blue-600 to-indigo-700 text-white font-black text-sm flex items-center justify-center shadow-lg ring-1 ring-white/20 group-hover:scale-105 transition-all">
            REC
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2 leading-none">
              RECNavigator
              <span className="text-[10px] bg-amber-400/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-400/20">
                REC CHENNAI
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              Rajalakshmi Engineering College
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-lg mx-4">
          <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
          <button
            onClick={() => onChangeTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'map' ? 'bg-rec-blue text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 text-amber-400" />
            3D Campus Map
          </button>

          <button
            onClick={() => onChangeTab('places')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'places' ? 'bg-rec-blue text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Grid className="w-4 h-4 text-amber-400" />
            Places
          </button>

          <button
            onClick={() => onChangeTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'about' ? 'bg-rec-blue text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Info className="w-4 h-4 text-amber-400" />
            About
          </button>

          <button
            onClick={() => onChangeTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'admin' ? 'bg-rec-blue text-white shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Admin
          </button>
        </div>

        {/* Action Button: Locate Me */}
        <button
          onClick={onLocateUser}
          title="Detect Current Location"
          className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl shadow-lg flex items-center gap-1.5 text-xs transition-all shrink-0 active:scale-95 border border-amber-400/30"
        >
          <Crosshair className="w-4 h-4" />
          <span className="hidden sm:inline">Locate Me</span>
        </button>
      </div>
    </header>
  );
};
