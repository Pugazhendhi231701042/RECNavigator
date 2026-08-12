import React from 'react';
import { PATH_NODES, PATH_EDGES } from '../../data/recCampusData';

export const Roads: React.FC = () => {
  return (
    <group>
      {PATH_EDGES.map(edge => {
        const fromNode = PATH_NODES.find(n => n.id === edge.from);
        const toNode = PATH_NODES.find(n => n.id === edge.to);
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

        return (
          <mesh
            key={edge.id}
            position={[midX, 0.08, midZ]}
            rotation={[0, angle, 0]}
            receiveShadow
          >
            <boxGeometry args={[10, 0.05, len]} />
            <meshStandardMaterial color="#4A5568" roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};
