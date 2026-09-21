import React, { Suspense } from 'react';
import { useTexture } from '@react-three/drei';
import type { Vector3D } from '../../types';

interface TerrainProps {
  onMapClick?: (point: Vector3D) => void;
}

function TexturedMapGround({ onMapClick }: TerrainProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const mapPath = `${baseUrl}assets/map/Map.png`.replace(/\/+/g, '/');
  const mapTexture = useTexture(mapPath);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.1, 0]}
      onPointerDown={(e) => {
        if (onMapClick) {
          e.stopPropagation();
          onMapClick({
            x: Math.round(e.point.x),
            y: 0.2,
            z: Math.round(e.point.z),
          });
        }
      }}
    >
      <planeGeometry args={[1300, 1300]} />
      <meshBasicMaterial map={mapTexture} toneMapped={false} />
    </mesh>
  );
}

function FallbackGround({ onMapClick }: TerrainProps) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.2, 0]}
      onPointerDown={(e) => {
        if (onMapClick) {
          e.stopPropagation();
          onMapClick({
            x: Math.round(e.point.x),
            y: 0.2,
            z: Math.round(e.point.z),
          });
        }
      }}
    >
      <planeGeometry args={[1400, 1400]} />
      <meshBasicMaterial color="#EAE6DF" />
    </mesh>
  );
}

export const Terrain: React.FC<TerrainProps> = ({ onMapClick }) => {
  return (
    <group>
      {/* 3D Ground Plane using Map Image from assets/map/Map.png */}
      <Suspense fallback={<FallbackGround onMapClick={onMapClick} />}>
        <TexturedMapGround onMapClick={onMapClick} />
      </Suspense>
    </group>
  );
};
