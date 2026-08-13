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
  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoUrl = `${baseUrl}assets/Elements/logo.png`.replace(/\/+/g, '/');

  return (
    <header className="bg-white/90 backdrop-blur-xl text-slate-900 shadow-sm sticky top-0 z-40 border-b border-purple-100/80">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onChangeTab('map')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-10 h-10 flex items-center justify-center bg-transparent group-hover:scale-105 transition-all">
            <img
              src={logoUrl}
              alt="REC Logo"
              className="w-full h-full object-contain bg-transparent"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#6A1B9A] flex items-center gap-2 leading-none">
              RECNavigator
            </h1>
            <p className="text-[11px] text-[#6A7282] font-semibold mt-0.5">
              Rajalakshmi Engineering College
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-lg mx-4">
          <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#FAFAFA] p-1.5 rounded-2xl border border-purple-100">
          <button
            onClick={() => onChangeTab('map')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'map' ? 'bg-[#6A1B9A] text-white shadow-md' : 'text-[#6A1B9A] hover:bg-purple-50'
            }`}
          >
            <Compass className={`w-4 h-4 ${activeTab === 'map' ? 'text-amber-300' : 'text-[#D97706]'}`} />
            3D Campus Map
          </button>

          <button
            onClick={() => onChangeTab('places')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'places' ? 'bg-[#6A1B9A] text-white shadow-md' : 'text-[#6A1B9A] hover:bg-purple-50'
            }`}
          >
            <Grid className={`w-4 h-4 ${activeTab === 'places' ? 'text-amber-300' : 'text-[#D97706]'}`} />
            Places
          </button>

          <button
            onClick={() => onChangeTab('about')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'about' ? 'bg-[#6A1B9A] text-white shadow-md' : 'text-[#6A1B9A] hover:bg-purple-50'
            }`}
          >
            <Info className={`w-4 h-4 ${activeTab === 'about' ? 'text-amber-300' : 'text-[#D97706]'}`} />
            About
          </button>

          <button
            onClick={() => onChangeTab('admin')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all ${
              activeTab === 'admin' ? 'bg-[#6A1B9A] text-white shadow-md' : 'text-[#6A1B9A] hover:bg-purple-50'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${activeTab === 'admin' ? 'text-amber-300' : 'text-[#D97706]'}`} />
            Admin
          </button>
        </div>

        {/* Action Button: Locate Me (Gold Tertiary Accent) */}
        <button
          onClick={onLocateUser}
          title="Detect Current Location"
          className="px-3.5 py-2.5 bg-gradient-to-r from-[#D97706] to-amber-500 hover:from-amber-600 hover:to-amber-600 text-white font-extrabold rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-all shrink-0 active:scale-95 border border-amber-300/40"
        >
          <Crosshair className="w-4 h-4 text-amber-100" />
          <span className="hidden sm:inline">Locate Me</span>
        </button>
      </div>
    </header>
  );
};
