import React, { Suspense } from 'react';
import { useTexture } from '@react-three/drei';

function TexturedMapGround() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const mapPath = `${baseUrl}assets/map/Map.png`.replace(/\/+/g, '/');
  const mapTexture = useTexture(mapPath);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
      <planeGeometry args={[650, 650]} />
      <meshBasicMaterial map={mapTexture} toneMapped={false} />
    </mesh>
  );
}

function FallbackGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[700, 700]} />
      <meshBasicMaterial color="#EAE6DF" />
    </mesh>
  );
}

export const Terrain: React.FC = () => {
  return (
    <group>
      {/* 3D Ground Plane using Map Image from assets/map/Map.png */}
      <Suspense fallback={<FallbackGround />}>
        <TexturedMapGround />
      </Suspense>
    </group>
  );
};
