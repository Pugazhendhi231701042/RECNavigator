import React, { useState } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize2, Tag, Waypoints, Sun, SlidersHorizontal, ChevronRight } from 'lucide-react';

interface MapControlsProps {
  showLabels: boolean;
  onToggleLabels: () => void;
  showRoads: boolean;
  onToggleRoads: () => void;
  brightness: number;
  onChangeBrightness: (b: number) => void;
  onResetCamera: () => void;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export const MapControls: React.FC<MapControlsProps> = ({
  showLabels,
  onToggleLabels,
  showRoads,
  onToggleRoads,
  brightness,
  onChangeBrightness,
  onResetCamera,
  controlsRef,
}) => {
  // Collapsable state: default collapsed (false)
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleZoomIn = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyIn(1.25);
      controlsRef.current.update();
    }
  };

  const handleZoomOut = () => {
    if (controlsRef.current) {
      controlsRef.current.dollyOut(1.25);
      controlsRef.current.update();
    }
  };

  const handleRotateLeft = () => {
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      const target = controlsRef.current.target;
      const x = cam.position.x - target.x;
      const z = cam.position.z - target.z;
      const angle = Math.PI / 8;
      cam.position.x = target.x + x * Math.cos(angle) - z * Math.sin(angle);
      cam.position.z = target.z + x * Math.sin(angle) + z * Math.cos(angle);
      controlsRef.current.update();
    }
  };

  const handleRotateRight = () => {
    if (controlsRef.current) {
      const cam = controlsRef.current.object;
      const target = controlsRef.current.target;
      const x = cam.position.x - target.x;
      const z = cam.position.z - target.z;
      const angle = -Math.PI / 8;
      cam.position.x = target.x + x * Math.cos(angle) - z * Math.sin(angle);
      cam.position.z = target.z + x * Math.sin(angle) + z * Math.cos(angle);
      controlsRef.current.update();
    }
  };

  const cycleBrightness = () => {
    if (brightness >= 2.2) onChangeBrightness(0.8);
    else if (brightness >= 1.7) onChangeBrightness(2.2);
    else if (brightness >= 1.2) onChangeBrightness(1.7);
    else onChangeBrightness(1.2);
  };

  // IF COLLAPSED: RENDER SINGLE GLASS FLOATING TOGGLE BUTTON
  if (!isExpanded) {
    return (
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={() => setIsExpanded(true)}
          title="Expand 3D Camera & Map Controls"
          className="p-3.5 bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-2xl border border-slate-700/80 rounded-2xl shadow-2xl text-amber-400 flex items-center justify-center transition-all transform active:scale-95 group ring-1 ring-white/10"
        >
          <SlidersHorizontal className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>
    );
  }

  // IF EXPANDED: RENDER FULL VERTICAL TOOLBAR WITH COLLAPSE BUTTON
  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-2xl p-2 rounded-2xl border border-slate-700/80 shadow-2xl text-white ring-1 ring-white/10 animate-in fade-in zoom-in-95 duration-200">
      {/* Collapse Header Button */}
      <button
        onClick={() => setIsExpanded(false)}
        title="Collapse Controls Toolbar"
        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors flex items-center justify-between gap-1 text-[11px] font-bold px-2.5 mb-1 border-b border-slate-800"
      >
        <span className="text-amber-400 font-extrabold uppercase tracking-wider text-[10px]">Controls</span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </button>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        title="Zoom In (+)"
        className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
      >
        <ZoomIn className="w-5 h-5" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        title="Zoom Out (-)"
        className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      <div className="w-full h-px bg-slate-800/80 my-0.5" />

      {/* Rotate Left */}
      <button
        onClick={handleRotateLeft}
        title="Rotate Camera Left"
        className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

      {/* Rotate Right */}
      <button
        onClick={handleRotateRight}
        title="Rotate Camera Right"
        className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
      >
        <RotateCw className="w-5 h-5" />
      </button>

      <div className="w-full h-px bg-slate-800/80 my-0.5" />

      {/* Brightness Adjustment Button */}
      <button
        onClick={cycleBrightness}
        title={`Scene Brightness: ${brightness.toFixed(1)}x (Click to cycle)`}
        className="p-2.5 rounded-xl transition-colors flex items-center justify-center text-xs font-bold active:scale-95 text-amber-400 hover:bg-slate-800"
      >
        <Sun className="w-5 h-5" />
      </button>

      {/* Toggle 3D Roads */}
      <button
        onClick={onToggleRoads}
        title="Show / Remove 3D Roads Overlay"
        className={`p-2.5 rounded-xl transition-colors flex items-center justify-center text-xs font-bold active:scale-95 ${
          showRoads ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Waypoints className="w-5 h-5" />
      </button>

      {/* Toggle Labels */}
      <button
        onClick={onToggleLabels}
        title="Toggle 3D Building Labels"
        className={`p-2.5 rounded-xl transition-colors flex items-center justify-center text-xs font-bold active:scale-95 ${
          showLabels ? 'bg-rec-blue text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`}
      >
        <Tag className="w-5 h-5" />
      </button>

      {/* Reset Camera View */}
      <button
        onClick={onResetCamera}
        title="Reset 3D Camera View"
        className="p-2.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
      >
        <Maximize2 className="w-5 h-5" />
      </button>
    </div>
  );
};
