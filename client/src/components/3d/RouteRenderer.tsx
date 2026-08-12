import React, { useMemo } from 'react';
import { Vector3 } from 'three';
import { Line } from '@react-three/drei';
import type { RouteResult } from '../../types';

interface RouteRendererProps {
  activeRoute: RouteResult | null;
}

export const RouteRenderer: React.FC<RouteRendererProps> = ({ activeRoute }) => {
  const points = useMemo(() => {
    if (!activeRoute || !activeRoute.nodes || activeRoute.nodes.length < 2) return [];
    
    // Elevate route Y position slightly (0.8m above ground) to avoid Z-fighting
    return activeRoute.nodes.map(n => new Vector3(n.position.x, n.position.y + 0.8, n.position.z));
  }, [activeRoute]);

  if (!activeRoute || points.length < 2) return null;

  return (
    <group>
      {/* Outer Glowing Path Ribbon */}
      <Line
        points={points}
        color="#60A5FA"
        lineWidth={12}
        opacity={0.7}
        transparent
      />

      {/* Core Solid Path Line */}
      <Line
        points={points}
        color="#2563EB"
        lineWidth={6}
      />
    </group>
  );
};
