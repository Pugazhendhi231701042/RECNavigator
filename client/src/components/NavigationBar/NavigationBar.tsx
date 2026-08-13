import React from 'react';
import { Compass, Grid, Info, ShieldCheck } from 'lucide-react';

interface NavigationBarProps {
  activeTab: 'map' | 'places' | 'about' | 'admin';
  onChangeTab: (tab: 'map' | 'places' | 'about' | 'admin') => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-2xl border-t border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-2xl">
      <button
        onClick={() => onChangeTab('map')}
        className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-all ${
          activeTab === 'map' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Compass className="w-5 h-5" />
        Map
      </button>

      <button
        onClick={() => onChangeTab('places')}
        className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-all ${
          activeTab === 'places' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Grid className="w-5 h-5" />
        Places
      </button>

      <button
        onClick={() => onChangeTab('about')}
        className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-all ${
          activeTab === 'about' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
        }`}
      >
        <Info className="w-5 h-5" />
        About
      </button>

      <button
        onClick={() => onChangeTab('admin')}
        className={`flex flex-col items-center gap-1 text-[10px] font-extrabold transition-all ${
          activeTab === 'admin' ? 'text-amber-400' : 'text-slate-400 hover:text-white'
        }`}
      >
        <ShieldCheck className="w-5 h-5" />
        Admin
      </button>
    </div>
  );
};
