import React from 'react';
import { Compass, Navigation, ShieldCheck, Database } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-65px)] bg-[#FAFAFA] text-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 pb-24">
        {/* Hero Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-[#6A1B9A] rounded-full text-xs font-extrabold uppercase tracking-wider border border-purple-200">
            <Compass className="w-4 h-4 text-[#D97706]" />
            Interactive 3D Campus Navigation System
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#6A1B9A] tracking-tight">
            RECNavigator
          </h1>
          <p className="text-[#6A7282] max-w-2xl mx-auto text-sm sm:text-base leading-relaxed font-medium">
            Designed specifically for students, staff, parents, and visitors to effortlessly navigate the campus of Rajalakshmi Engineering College (REC), Chennai.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6A1B9A] flex items-center justify-center font-bold">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#6A1B9A]">Interactive 3D Map</h3>
            <p className="text-xs text-[#6A7282] leading-relaxed">
              Pan, zoom, rotate, inspect 3D buildings, view facilities, and explore campus under clear 3D sky atmosphere.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-[#D97706] flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#6A1B9A]">Dijkstra Shortest Path</h3>
            <p className="text-xs text-[#6A7282] leading-relaxed">
              Deterministic graph-based routing calculates walking distance, estimated minutes, and step-by-step turn instructions.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-purple-100 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6A1B9A] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-[#6A1B9A]">Admin & 3D Editing</h3>
            <p className="text-xs text-[#6A7282] leading-relaxed">
              Manage locations, categories, building rotation, and road network nodes live in 3D with password protection (Admin@2711).
            </p>
          </div>
        </div>

        {/* Architecture & Decoupling Section */}
        <div className="bg-white p-6 rounded-3xl border border-purple-100 shadow-md space-y-4">
          <h3 className="text-lg font-black text-[#6A1B9A] flex items-center gap-2">
            <Database className="w-5 h-5 text-[#D97706]" />
            Data Decoupling & Map Editability
          </h3>
          <p className="text-xs text-[#6A7282] leading-relaxed">
            RECNavigator strictly isolates campus building geometry, node graphs, and metadata inside <code className="bg-purple-50 px-1.5 py-0.5 rounded text-[#6A1B9A] font-mono text-[11px]">recCampusData.ts</code> and Mongoose database models.
          </p>

          <div className="bg-[#FAFAFA] p-4 rounded-2xl border border-purple-100 space-y-2">
            <h4 className="text-xs font-extrabold text-[#6A1B9A] uppercase tracking-wider">Key Project Directories</h4>
            <ul className="text-xs text-[#6A7282] space-y-1 font-mono">
              <li>• <strong className="text-slate-900">Map Data & Graph:</strong> <code className="text-[#6A1B9A]">client/src/data/recCampusData.ts</code></li>
              <li>• <strong className="text-slate-900">Dijkstra Algorithm:</strong> <code className="text-[#6A1B9A]">client/src/utils/routing/dijkstra.ts</code></li>
              <li>• <strong className="text-slate-900">3D WebGL Canvas Component:</strong> <code className="text-[#6A1B9A]">client/src/components/3d/CampusScene.tsx</code></li>
            </ul>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs text-[#6A7282]">
          RECNavigator v1.0.0 — Rajalakshmi Engineering College (REC), Chennai.
        </div>
      </div>
    </div>
  );
};
