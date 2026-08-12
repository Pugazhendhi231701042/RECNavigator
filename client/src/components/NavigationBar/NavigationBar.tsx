import React from 'react';
import { Compass, Navigation, Grid, Info, ShieldCheck } from 'lucide-react';

interface NavigationBarProps {
  activeTab: 'map' | 'directions' | 'places' | 'about' | 'admin';
  onChangeTab: (tab: 'map' | 'directions' | 'places' | 'about' | 'admin') => void;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs = [
    { id: 'map', label: 'Explore', icon: <Compass className="w-5 h-5" /> },
    { id: 'directions', label: 'Directions', icon: <Navigation className="w-5 h-5" /> },
    { id: 'places', label: 'Places', icon: <Grid className="w-5 h-5" /> },
    { id: 'about', label: 'About', icon: <Info className="w-5 h-5" /> },
    { id: 'admin', label: 'Admin', icon: <ShieldCheck className="w-5 h-5" /> },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-2 lg:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-rec-blue font-bold scale-105'
                  : 'text-slate-500 font-medium hover:text-slate-800'
              }`}
            >
              {tab.icon}
              <span className="text-[11px]">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
