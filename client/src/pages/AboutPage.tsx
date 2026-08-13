import React from 'react';
import { Compass, Navigation, ShieldCheck, Database } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
      {/* Hero Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-rec-blue/10 text-rec-blue rounded-full text-xs font-bold uppercase tracking-wider">
          <Compass className="w-4 h-4 text-rec-gold" />
          Interactive 3D Campus Navigation System
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          RECNavigator
        </h1>
        <p className="text-slate-600 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Designed specifically for students, staff, parents, and visitors to effortlessly navigate the campus of Rajalakshmi Engineering College (REC), Chennai.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Interactive 3D Map</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Pan, zoom, rotate, inspect 3D buildings, view facilities, and explore campus under clear 3D sky atmosphere.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Navigation className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Dijkstra Shortest Path</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deterministic graph-based routing calculates walking distance, estimated minutes, and step-by-step turn instructions.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">Admin & 3D Editing</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Manage locations, categories, building rotation, and road network nodes live in 3D.
          </p>
        </div>
      </div>

      {/* Architecture & Decoupling Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-5 h-5 text-rec-blue" />
          Data Decoupling & Map Editability
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          RECNavigator strictly isolates campus building geometry, node graphs, and metadata inside <code className="bg-slate-100 px-1.5 py-0.5 rounded text-rec-blue font-mono text-[11px]">recCampusData.ts</code> and Mongoose database models.
        </p>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Key Project Directories</h4>
          <ul className="text-xs text-slate-600 space-y-1 font-mono">
            <li>• <strong className="text-slate-800">Map Data & Graph:</strong> <code className="text-rec-blue">client/src/data/recCampusData.ts</code></li>
            <li>• <strong className="text-slate-800">Dijkstra Algorithm:</strong> <code className="text-rec-blue">client/src/utils/routing/dijkstra.ts</code></li>
            <li>• <strong className="text-slate-800">3D WebGL Canvas Component:</strong> <code className="text-rec-blue">client/src/components/3d/CampusScene.tsx</code></li>
          </ul>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-slate-400">
        RECNavigator v1.0.0 — Rajalakshmi Engineering College (REC), Chennai.
      </div>
    </div>
  );
};
