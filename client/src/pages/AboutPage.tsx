import React from 'react';
import { Compass, Navigation, ShieldCheck, Database, MousePointer, Cpu } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="w-full min-h-[calc(100vh-65px)] overflow-y-auto bg-slate-100/70 dark:bg-[#080B11] text-slate-900 dark:text-white select-none transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 pb-32">
        {/* Top Header */}
        <div className="text-center space-y-3 pt-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-full text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-800/60 font-mono">
            <Compass className="w-3.5 h-3.5 text-amber-500" />
            SYSTEM SPECIFICATIONS • VERSION 2.0
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            REC Navigator Studio
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-xs sm:text-sm leading-relaxed font-medium">
            Next-generation 3D spatial mapping and deterministic graph navigation system engineered for Rajalakshmi Engineering College (REC), Chennai.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black border border-purple-200 dark:border-purple-800">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">3D WebGL Spatial Engine</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Powered by Three.js and React Three Fiber with realistic atmospheric sky shading, procedural terrain, road corridors, and 3D architectural GLTF models.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black border border-amber-200 dark:border-amber-800">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Multi-Entrance Dijkstra Router</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Evaluates all possible building entrances in parallel to synthesize optimal walking paths with authoritative distances, estimated durations, and turn directions.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-black border border-cyan-200 dark:border-cyan-800">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">CAD Studio Campus Editor</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Visual map construction portal equipped with 3D translation/rotation/scale gizmos, raycast junction creation, multi-junction road authoring, and route testing.
            </p>
          </div>

          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-md space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Security & Resilience</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Session-protected administrative access with encrypted state persistence, full system wipe safeguards, and one-click default dataset restoration.
            </p>
          </div>
        </div>

        {/* 3D Map Controls Reference Matrix */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <MousePointer className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Studio Navigation & Mouse Controls Cheat Sheet
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Rotate / Orbit Camera</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 shadow-sm">
                Left Click + Drag
              </kbd>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Pan / Translate Camera</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-black text-purple-600 dark:text-purple-400 shadow-sm">
                Middle Click + Drag
              </kbd>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Zoom / Dolly Camera</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-black text-amber-600 dark:text-amber-400 shadow-sm">
                Right Click + Drag / Wheel
              </kbd>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select & Inspect Building</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-black text-cyan-600 dark:text-cyan-400 shadow-sm">
                Single Click
              </kbd>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between sm:col-span-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Smooth Zoom Focus into Building</span>
              <kbd className="px-2.5 py-1 bg-white dark:bg-slate-800 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-mono font-black text-emerald-600 dark:text-emerald-400 shadow-sm">
                Double Click Building
              </kbd>
            </div>
          </div>
        </div>

        {/* Data Decoupling Architecture */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-slate-800/80 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-800">
            <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Data Decoupling & Extensibility
            </h3>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            All GIS coordinates, building GLTF models, multi-entrance junction references, and road topologies are strictly decoupled into declarative TypeScript schemas and Mongoose database definitions:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 font-mono">Dataset</p>
              <code className="text-xs font-mono text-slate-800 dark:text-slate-200 block truncate">
                recCampusData.ts
              </code>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-black uppercase text-amber-600 dark:text-amber-400 font-mono">Routing</p>
              <code className="text-xs font-mono text-slate-800 dark:text-slate-200 block truncate">
                dijkstra.ts
              </code>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
              <p className="text-[10px] font-black uppercase text-cyan-600 dark:text-cyan-400 font-mono">3D Scene</p>
              <code className="text-xs font-mono text-slate-800 dark:text-slate-200 block truncate">
                CampusScene.tsx
              </code>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-xs font-mono text-slate-500 dark:text-slate-400 pt-4">
          Rajalakshmi Engineering College (Autonomous), Thandalam, Chennai • REC Navigator v2.0
        </div>
      </div>
    </div>
  );
};
