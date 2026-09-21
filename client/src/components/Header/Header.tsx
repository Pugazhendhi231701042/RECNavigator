import React from 'react';
import type { Location } from '../../types';
import { SearchBar } from '../SearchBar/SearchBar';
import { Compass, Grid, Info, ShieldCheck, Crosshair, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, toggleTheme } = useTheme();
  const baseUrl = import.meta.env.BASE_URL || '/';
  const logoUrl = `${baseUrl}assets/Elements/logo.png`.replace(/\/+/g, '/');

  return (
    <header className="bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl text-slate-900 dark:text-white shadow-sm sticky top-0 z-40 border-b border-slate-200/90 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div
          onClick={() => onChangeTab('map')}
          className="flex items-center gap-3 cursor-pointer select-none group shrink-0"
        >
          <div className="w-9 h-9 flex items-center justify-center bg-transparent group-hover:scale-105 transition-all">
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
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-purple-700 dark:text-purple-300 leading-none">
                RECNavigator
              </h1>
              <span className="text-[10px] font-black tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase font-mono hidden sm:inline">
                STUDIO
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">
              Rajalakshmi Engineering College
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block flex-1 max-w-md mx-2">
          <SearchBar locations={locations} onSelectLocation={onSelectLocation} />
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-100/90 dark:bg-slate-900/90 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => onChangeTab('map')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 ${activeTab === 'map' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>3D Map</span>
          </button>

          <button
            onClick={() => onChangeTab('places')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'places'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Grid className={`w-3.5 h-3.5 ${activeTab === 'places' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>Places</span>
          </button>

          <button
            onClick={() => onChangeTab('about')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'about'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <Info className={`w-3.5 h-3.5 ${activeTab === 'about' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>About</span>
          </button>

          <button
            onClick={() => onChangeTab('admin')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'admin' ? 'text-amber-300' : 'text-amber-500'}`} />
            <span>Admin</span>
          </button>
        </div>

        {/* Right Tools: Theme Switcher & Locate Me */}
        <div className="flex items-center gap-2">
          {/* THEME SWITCH BUTTON */}
          <button
            id="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Studio Mode' : 'Switch to Light Studio Mode'}
            aria-label="Toggle Light/Dark Theme"
            className="p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/90 border-slate-200 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 dark:text-amber-300 shadow-sm active:scale-95 text-xs font-bold"
          >
            {theme === 'light' ? (
              <>
                <Moon className="w-4 h-4 text-purple-600" />
                <span className="hidden sm:inline text-[11px] text-slate-600 font-semibold">Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-[11px] text-amber-300 font-semibold">Light</span>
              </>
            )}
          </button>

          {/* Action Button: Locate Me */}
          <button
            onClick={onLocateUser}
            title="Detect Current Location"
            className="px-3 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl shadow-md flex items-center gap-1.5 text-xs transition-all shrink-0 active:scale-95 border border-amber-400/40 cursor-pointer"
          >
            <Crosshair className="w-3.5 h-3.5 text-slate-950" />
            <span className="hidden sm:inline">Locate</span>
          </button>
        </div>
      </div>
    </header>
  );
};
