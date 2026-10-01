import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  Vector3,
  Object3D,
  Shape,
  ExtrudeGeometry,
  InstancedMesh,
  Mesh,
} from 'three';
import { Line } from '@react-three/drei';
import type { RouteResult } from '../../types';
import { createSmoothPathFromNodes } from '../../utils/curvePath';

interface RouteRendererProps {
  activeRoute: RouteResult | null;
}

export const RouteRenderer: React.FC<RouteRendererProps> = ({ activeRoute }) => {
  const instancedMeshRef = useRef<InstancedMesh>(null);
  const flowOffset = useRef<number>(0);
  const dummy = useMemo(() => new Object3D(), []);
  const destBeaconRef = useRef<Mesh>(null);
  const startRingRef = useRef<Mesh>(null);

  // Construct smooth 3D path curve strictly following road centerlines with rounded junction fillets
  const curve = useMemo(() => {
    if (!activeRoute || !activeRoute.nodes || activeRoute.nodes.length < 2) return null;

    // Elevation of 0.12m sits directly on the road surface (road height is 0.09m)
    return createSmoothPathFromNodes(
      activeRoute.nodes.map(n => n.position),
      3.5,
      0.12
    );
  }, [activeRoute]);

  const totalLength = useMemo(() => (curve ? curve.getLength() : 0), [curve]);

  // Arrow spacing along the path (in meters)
  const spacing = 3.2;
  const maxArrows = useMemo(() => {
    if (totalLength <= 0) return 0;
    return Math.max(2, Math.ceil(totalLength / spacing) + 2);
  }, [totalLength, spacing]);

  // Subtle guide rail on the road surface beneath the flowing arrows
  const railPoints = useMemo(() => {
    if (!curve || totalLength <= 0) return [];
    const ptsCount = Math.max(16, Math.min(120, Math.round(totalLength / 2.0)));
    return curve.getPoints(ptsCount).map(p => new Vector3(p.x, p.y - 0.01, p.z));
  }, [curve, totalLength]);

  // 3D Extruded Sleek Directional Chevron Arrow (sized to sit comfortably inside a 10m road)
  const arrowGeometry = useMemo(() => {
    const shape = new Shape();
    // Tip at front (+Y in 2D)
    shape.moveTo(0, 0.95);
    // Right outer wing (width = 1.7m, well inside the 10m road)
    shape.lineTo(0.85, -0.55);
    // Right inner notch
    shape.lineTo(0.42, -0.55);
    // Center notch
    shape.lineTo(0, 0.0);
    // Left inner notch
    shape.lineTo(-0.42, -0.55);
    // Left outer wing
    shape.lineTo(-0.85, -0.55);
    shape.closePath();

    const geom = new ExtrudeGeometry(shape, {
      depth: 0.06,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.02,
      bevelThickness: 0.02,
    });
    // Rotate so shape lies in the horizontal XZ plane, pointing forward along +Z
    geom.rotateX(Math.PI / 2);
    geom.center();
    return geom;
  }, []);

  // Frame animation loop for streaming flow of directional arrows & destination beacon
  useFrame((state, delta) => {
    // Pulse destination beacon and start ring
    const time = state.clock.getElapsedTime();
    if (destBeaconRef.current) {
      destBeaconRef.current.rotation.y = time * 2;
      destBeaconRef.current.position.y = 3.0 + Math.sin(time * 3) * 0.35;
    }
    if (startRingRef.current) {
      const ringScale = 1 + Math.sin(time * 4) * 0.12;
      startRingRef.current.scale.set(ringScale, ringScale, 1);
    }

    if (!curve || !instancedMeshRef.current || totalLength <= 0) return;

    // Advance flow offset forward at ~5.0 meters per second
    flowOffset.current = (flowOffset.current + delta * 5.0) % spacing;

    for (let i = 0; i < maxArrows; i++) {
      const dist = i * spacing + flowOffset.current;

      if (dist < 0.2 || dist > totalLength - 0.2) {
        // Hide arrow outside active path range
        dummy.position.set(0, -9999, 0);
        dummy.scale.set(0, 0, 0);
        dummy.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      } else {
        const u = dist / totalLength;
        const pt = curve.getPointAt(u);
        const tan = curve.getTangentAt(u);

        // Yaw angle in horizontal plane (pointing exactly in walking direction)
        const yaw = Math.atan2(tan.x, tan.z);
        // Pitch angle for elevation slope
        const pitch = -Math.asin(
          Math.max(-0.99, Math.min(0.99, (tan.y || 0) / Math.max(0.001, tan.length())))
        );

        // Smooth fade scale at route start & destination edges so arrows enter and exit smoothly
        const edgeDist = Math.min(dist, totalLength - dist);
        const fade = Math.min(1.0, Math.max(0.05, edgeDist / 2.0));

        // Position arrow directly on road surface
        dummy.position.set(pt.x, pt.y, pt.z);
        dummy.rotation.set(pitch, yaw, 0);
        dummy.scale.set(fade, fade, fade);
        dummy.updateMatrix();
        instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
      }
    }

    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!activeRoute || !curve || maxArrows === 0) return null;

  const startNode = activeRoute.nodes[0];
  const destNode = activeRoute.nodes[activeRoute.nodes.length - 1];

  return (
    <group>
      {/* Subtle guide track inside the road beneath the flowing arrows */}
      {railPoints.length >= 2 && (
        <Line
          points={railPoints}
          color="#0284C7"
          lineWidth={2.5}
          opacity={0.25}
          transparent
        />
      )}

      {/* High-Performance Animated Streaming Instanced Chevrons */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[arrowGeometry, undefined, maxArrows]}
      >
        <meshStandardMaterial
          color="#00F0FF"
          emissive="#00D2FF"
          emissiveIntensity={2.4}
          roughness={0.15}
          metalness={0.6}
          toneMapped={false}
        />
      </instancedMesh>

      {/* Start Location Glowing Pulsing Ring */}
      {startNode && (
        <group position={[startNode.position.x, (startNode.position.y || 0) + 0.12, startNode.position.z]}>
          <mesh ref={startRingRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.5, 2.0, 32]} />
            <meshBasicMaterial color="#00F0FF" toneMapped={false} transparent opacity={0.85} />
          </mesh>
        </group>
      )}

      {/* Destination Location Glowing Target Ring & Hovering Beacon */}
      {destNode && (
        <group position={[destNode.position.x, (destNode.position.y || 0) + 0.12, destNode.position.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.0, 2.7, 32]} />
            <meshBasicMaterial color="#10B981" toneMapped={false} transparent opacity={0.85} />
          </mesh>

          {/* Floating animated crystal beacon at destination */}
          <mesh ref={destBeaconRef} position={[0, 2.8, 0]}>
            <octahedronGeometry args={[0.85, 0]} />
            <meshStandardMaterial
              color="#10B981"
              emissive="#34D399"
              emissiveIntensity={2.5}
              roughness={0.1}
              metalness={0.9}
              toneMapped={false}
            />
          </mesh>
        </group>
      )}
    </group>
  );
};
