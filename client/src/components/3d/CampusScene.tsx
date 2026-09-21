import React, { useCallback, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Html } from '@react-three/drei';
import { MOUSE } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, RouteResult, PathNode, PathEdge, Road, Vector3D } from '../../types';
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
  focusLocation?: Location | null;
  onDoubleClickLocation?: (loc: Location) => void;
  activeRoute: RouteResult | null;
  startLocation: Location | null;
  destinationLocation: Location | null;
  showLabels: boolean;
  showRoads?: boolean;
  brightness?: number; // 0.5 to 2.5
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  nodes?: PathNode[];
  edges?: PathEdge[];
  showJunctionMarkers?: boolean;
  // Admin visual & interactive capabilities
  cameraMode?: 'perspective' | 'top';
  activeSection?: 'buildings' | 'junctions-roads';
  selectedJunctionId?: string | null;
  onSelectJunction?: (node: PathNode) => void;
  selectedRoadId?: string | null;
  onSelectRoad?: (roadId: string) => void;
  onMapClick?: (point: Vector3D) => void;
  isAddMode?: boolean;
  transformMode?: 'translate' | 'rotate' | 'scale' | null;
  onBuildingTransform?: (newPos: Vector3D, newRotY: number, newScale: number) => void;
  roads?: Road[];
}

export const CampusScene: React.FC<CampusSceneProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  focusLocation,
  onDoubleClickLocation,
  activeRoute,
  startLocation,
  destinationLocation,
  showLabels,
  showRoads = true,
  brightness = 1.3,
  controlsRef,
  nodes,
  edges,
  showJunctionMarkers = false,
  cameraMode = 'perspective',
  activeSection = 'buildings',
  selectedJunctionId,
  onSelectJunction,
  selectedRoadId,
  onSelectRoad,
  onMapClick,
  isAddMode = false,
  transformMode = null,
  onBuildingTransform,
  roads = [],
}) => {
  const [internalFocusLocation, setInternalFocusLocation] = useState<Location | null>(null);

  const activeFocus = focusLocation !== undefined ? focusLocation : internalFocusLocation;

  const handleDoubleClickBuilding = useCallback((loc: Location) => {
    setInternalFocusLocation(loc);
    onDoubleClickLocation?.(loc);
  }, [onDoubleClickLocation]);
  const handleTransformStart = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = false;
    }
  }, [controlsRef]);

  const handleTransformEnd = useCallback(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = true;
    }
  }, [controlsRef]);

  // Find target coordinate for camera if a junction is selected
  const selectedJunctionNode = nodes?.find(n => n.id === selectedJunctionId);
  const cameraTargetPoint = selectedJunctionNode ? selectedJunctionNode.position : null;

  return (
    <div
      onContextMenu={(e) => e.preventDefault()}
      className={`w-full h-full relative bg-sky-100 dark:bg-sky-950 select-none touch-none transition-colors duration-300 ${
        isAddMode ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing'
      }`}
    >
      <Canvas
        onContextMenu={(e) => e.preventDefault()}
        camera={{ position: [0, 180, 260], fov: 45, near: 1, far: 3500 }}
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

        {/* Directional Sun Overhead Light */}
        <directionalLight position={[150, 250, 100]} intensity={brightness * 1.1} />

        {/* Hemisphere Light for Warm Outdoor Shading */}
        <hemisphereLight intensity={brightness * 0.4} groundColor="#4B5563" color="#FFFFFF" />

        {/* Camera Smooth Target Controller zooming ONLY on double-click or targetPoint */}
        <CameraController
          focusLocation={activeFocus}
          controlsRef={controlsRef}
          cameraMode={cameraMode}
          targetPoint={cameraTargetPoint}
        />

        {/* 3D Scene Terrain Ground with Raycasting */}
        <Terrain onMapClick={onMapClick} />

        {/* 3D Roads Layer */}
        {showRoads && (
          <Roads
            nodes={nodes}
            edges={edges}
            roads={roads}
            selectedRoadId={selectedRoadId}
            onSelectRoad={onSelectRoad}
          />
        )}

        {/* Visual Junction Markers in Admin Mode */}
        {showJunctionMarkers && nodes && (
          <group>
            {nodes.map(node => {
              const isJunctionSelected = selectedJunctionId === node.id;
              return (
                <group
                  key={node.id}
                  position={[node.position.x, node.position.y + 0.6, node.position.z]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectJunction?.(node);
                  }}
                >
                  <mesh>
                    <sphereGeometry args={[isJunctionSelected ? 2.4 : 1.6, 16, 16]} />
                    <meshStandardMaterial
                      color={isJunctionSelected ? '#38BDF8' : '#F59E0B'}
                      emissive={isJunctionSelected ? '#0284C7' : '#D97706'}
                      emissiveIntensity={isJunctionSelected ? 1.0 : 0.8}
                      roughness={0.2}
                    />
                  </mesh>

                  {/* Junction Halo Ring if Selected */}
                  {isJunctionSelected && (
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]}>
                      <ringGeometry args={[3, 4, 24]} />
                      <meshBasicMaterial color="#38BDF8" toneMapped={false} />
                    </mesh>
                  )}

                  <Html distanceFactor={85} center position={[0, 3, 0]}>
                    <div
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shadow-md whitespace-nowrap cursor-pointer transition-all ${
                        isJunctionSelected
                          ? 'bg-sky-900 text-sky-200 border-sky-400 scale-110 ring-2 ring-sky-400'
                          : 'bg-slate-900/90 text-amber-300 border-amber-400/50 hover:bg-slate-800'
                      }`}
                    >
                      📍 {node.name}
                    </div>
                  </Html>
                </group>
              );
            })}
          </group>
        )}

        {/* Buildings Layer with Subdued mode and TransformControls */}
        <Buildings
          locations={locations}
          selectedLocation={selectedLocation}
          onSelectLocation={onSelectLocation}
          onDoubleClickLocation={handleDoubleClickBuilding}
          subdued={activeSection === 'junctions-roads'}
          transformMode={transformMode}
          onTransformChange={onBuildingTransform}
          onTransformStart={handleTransformStart}
          onTransformEnd={handleTransformEnd}
          nodes={nodes}
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
          onDoubleClickLocation={handleDoubleClickBuilding}
          showLabels={showLabels}
        />

        {/* Orbit Controls with User-Requested Mouse Mapping */}
        <OrbitControls
          ref={controlsRef}
          makeDefault
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={cameraMode === 'top' ? 0.3 : 0.8}
          zoomSpeed={1.2}
          panSpeed={0.8}
          screenSpacePanning={true}
          maxPolarAngle={cameraMode === 'top' ? 0.05 : Math.PI / 2 - 0.05}
          minDistance={10}
          maxDistance={1600}
          enableZoom={true}
          mouseButtons={{
            LEFT: MOUSE.ROTATE,
            MIDDLE: MOUSE.PAN,
            RIGHT: MOUSE.DOLLY,
          }}
        />
      </Canvas>
    </div>
  );
};
