import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, RouteResult } from '../../types';
import { Terrain } from './Terrain';
import { Roads } from './Roads';
import { Buildings } from './Buildings';
import { RouteRenderer } from './RouteRenderer';
import { LocationMarker3D } from './LocationMarker3D';
import { CameraController } from './CameraController';

interface CampusSceneProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  activeRoute: RouteResult | null;
  startLocation: Location | null;
  destinationLocation: Location | null;
  showLabels: boolean;
  showRoads?: boolean;
  brightness?: number; // 0.5 to 2.5
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export const CampusScene: React.FC<CampusSceneProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeRoute,
  startLocation,
  destinationLocation,
  showLabels,
  showRoads = true,
  brightness = 1.3,
  controlsRef,
}) => {
  return (
    <div className="w-full h-full relative bg-sky-950 select-none touch-none cursor-grab active:cursor-grabbing">
      <Canvas
        camera={{ position: [0, 180, 260], fov: 45, near: 1, far: 2000 }}
        className="w-full h-full"
      >
        {/* 3D Realistic Atmospheric Sky */}
        <Sky
          distance={450000}
          sunPosition={[120, 90, 120]}
          inclination={0.6}
          azimuth={0.25}
          turbidity={8}
          rayleigh={1.5}
        />

        {/* Sky & Sun Ambient Lighting with Dynamic Brightness Control */}
        <ambientLight intensity={brightness * 0.9} />

        {/* Directional Sun Overhead Light (No Shadows) */}
        <directionalLight position={[150, 250, 100]} intensity={brightness * 1.1} />

        {/* Hemisphere Light for Warm Outdoor Shading */}
        <hemisphereLight intensity={brightness * 0.4} groundColor="#4B5563" color="#FFFFFF" />

        {/* Camera Smooth Target Controller */}
        <CameraController selectedLocation={selectedLocation} controlsRef={controlsRef} />

        {/* 3D Scene Layers */}
        <Terrain />

        {/* 3D Roads Layer */}
        {showRoads && <Roads />}

        <Buildings
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
        />
        
        {/* 3D Route Polyline */}
        <RouteRenderer activeRoute={activeRoute} />

        {/* 3D HTML Pins & Labels */}
        <LocationMarker3D
          locations={locations}
          selectedLocation={selectedLocation}
          startLocation={startLocation}
          destinationLocation={destinationLocation}
          onSelectLocation={onSelectLocation}
          showLabels={showLabels}
        />

        {/* Orbit Controls */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          zoomSpeed={1.2}
          panSpeed={0.8}
          screenSpacePanning={true}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={20}
          maxDistance={600}
        />
      </Canvas>
    </div>
  );
};
