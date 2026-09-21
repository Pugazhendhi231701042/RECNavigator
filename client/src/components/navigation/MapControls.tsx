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
          className="p-3 bg-white/90 dark:bg-slate-900/90 hover:bg-white dark:hover:bg-slate-800 backdrop-blur-2xl border border-slate-200/90 dark:border-slate-800/80 rounded-2xl shadow-xl text-purple-600 dark:text-purple-400 flex items-center justify-center transition-all transform active:scale-95 group cursor-pointer"
        >
          <SlidersHorizontal className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 text-amber-500" />
        </button>
      </div>
    );
  }

  // IF EXPANDED: RENDER FULL STUDIO GLASS TOOLBAR
  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-1.5 bg-white/90 dark:bg-slate-950/85 backdrop-blur-2xl p-2 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 shadow-2xl text-slate-900 dark:text-white animate-in fade-in zoom-in-95 duration-200">
      {/* Collapse Header Button */}
      <button
        onClick={() => setIsExpanded(false)}
        title="Collapse Controls Toolbar"
        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors flex items-center justify-between gap-1 text-[10px] font-bold px-2 mb-0.5 border-b border-slate-100 dark:border-slate-800 cursor-pointer"
      >
        <span className="text-purple-600 dark:text-purple-400 font-extrabold uppercase tracking-wider text-[10px]">Controls</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>

      {/* Zoom In */}
      <button
        onClick={handleZoomIn}
        title="Zoom In (+)"
        className="p-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
      >
        <ZoomIn className="w-4 h-4" />
      </button>

      {/* Zoom Out */}
      <button
        onClick={handleZoomOut}
        title="Zoom Out (-)"
        className="p-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
      >
        <ZoomOut className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800 my-0.5" />

      {/* Rotate Left */}
      <button
        onClick={handleRotateLeft}
        title="Rotate Camera Left"
        className="p-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Rotate Right */}
      <button
        onClick={handleRotateRight}
        title="Rotate Camera Right"
        className="p-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
      >
        <RotateCw className="w-4 h-4" />
      </button>

      <div className="w-full h-px bg-slate-200/80 dark:bg-slate-800 my-0.5" />

      {/* Brightness Adjustment Button */}
      <button
        onClick={cycleBrightness}
        title={`Scene Brightness: ${brightness.toFixed(1)}x (Click to cycle)`}
        className="p-2 rounded-xl transition-colors flex items-center justify-center text-xs font-bold active:scale-95 text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
      >
        <Sun className="w-4 h-4" />
      </button>

      {/* Toggle 3D Roads */}
      <button
        onClick={onToggleRoads}
        title="Show / Remove 3D Roads Overlay"
        className={`p-2 rounded-xl transition-colors flex items-center justify-center text-xs font-bold active:scale-95 cursor-pointer ${
          showRoads ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Waypoints className="w-4 h-4" />
      </button>

      {/* Toggle Labels */}
      <button
        onClick={onToggleLabels}
        title="Toggle 3D Building Labels"
        className={`p-2 rounded-xl transition-colors flex items-center justify-center text-xs font-bold active:scale-95 cursor-pointer ${
          showLabels ? 'bg-purple-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
      >
        <Tag className="w-4 h-4" />
      </button>

      {/* Reset Camera View */}
      <button
        onClick={onResetCamera}
        title="Reset 3D Camera View"
        className="p-2 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95 cursor-pointer flex items-center justify-center"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
    </div>
  );
};
