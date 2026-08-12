import React from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { ZoomIn, ZoomOut, RotateCcw, RotateCw, Maximize2, Tag, Waypoints, Sun } from 'lucide-react';

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

  return (
    <div className="absolute top-4 right-4 z-30 flex flex-col gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/80 shadow-2xl text-white">
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

      <div className="w-full h-px bg-slate-700/80 my-0.5" />

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

      <div className="w-full h-px bg-slate-700/80 my-0.5" />

      {/* Brightness Adjustment Button */}
      <button
        onClick={cycleBrightness}
        title={`Scene Brightness: ${(brightness).toFixed(1)}x (Click to cycle)`}
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
