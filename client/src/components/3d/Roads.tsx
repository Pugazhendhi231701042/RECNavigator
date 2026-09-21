import React from 'react';
import type { PathEdge, PathNode, Road } from '../../types';
import { PATH_NODES as DEFAULT_NODES, PATH_EDGES as DEFAULT_EDGES } from '../../data/recCampusData';

interface RoadsProps {
  edges?: PathEdge[];
  nodes?: PathNode[];
  roads?: Road[];
  selectedRoadId?: string | null;
  onSelectRoad?: (roadId: string) => void;
}

export const Roads: React.FC<RoadsProps> = ({
  edges = DEFAULT_EDGES,
  nodes = DEFAULT_NODES,
  roads = [],
  selectedRoadId,
  onSelectRoad,
}) => {
  // Find which road owns this edge (if any)
  const getOwningRoadId = (fromId: string, toId: string): string | null => {
    for (const r of roads) {
      for (let i = 0; i < r.junctionIds.length - 1; i++) {
        const a = r.junctionIds[i];
        const b = r.junctionIds[i + 1];
        if ((a === fromId && b === toId) || (a === toId && b === fromId)) {
          return r.id;
        }
      }
    }
    return null;
  };

  return (
    <group>
      {edges.map(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const p1 = fromNode.position;
        const p2 = toNode.position;

        // Calculate segment length and angle for 3D road box mesh
        const dx = p2.x - p1.x;
        const dz = p2.z - p1.z;
        const len = Math.sqrt(dx * dx + dz * dz);
        const angle = Math.atan2(dx, dz);
        const midX = (p1.x + p2.x) / 2;
        const midZ = (p1.z + p2.z) / 2;

        const ownerRoadId = getOwningRoadId(edge.from, edge.to);
        const isRoadSelected = Boolean(selectedRoadId && ownerRoadId === selectedRoadId);

        const roadWidth = isRoadSelected ? 12 : 9.5;
        const roadHeight = isRoadSelected ? 0.2 : 0.08;

        return (
          <group key={edge.id}>
            <mesh
              position={[midX, roadHeight / 2, midZ]}
              rotation={[0, angle, 0]}
              receiveShadow
              onClick={(e) => {
                if (ownerRoadId && onSelectRoad) {
                  e.stopPropagation();
                  onSelectRoad(ownerRoadId);
                }
              }}
            >
              <boxGeometry args={[roadWidth, roadHeight, len]} />
              <meshStandardMaterial
                color={isRoadSelected ? '#06B6D4' : '#334155'}
                emissive={isRoadSelected ? '#0891B2' : '#000000'}
                emissiveIntensity={isRoadSelected ? 0.8 : 0}
                roughness={isRoadSelected ? 0.2 : 0.8}
              />
            </mesh>

            {/* Subtle Road Center Strip / Dash */}
            <mesh
              position={[midX, roadHeight + 0.02, midZ]}
              rotation={[0, angle, 0]}
            >
              <boxGeometry args={[0.5, 0.02, len]} />
              <meshBasicMaterial
                color={isRoadSelected ? '#E0F2FE' : '#64748B'}
                transparent
                opacity={0.7}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
