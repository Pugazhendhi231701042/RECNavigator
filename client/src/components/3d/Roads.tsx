import React, { useMemo } from 'react';
import { Vector3, BufferGeometry, Float32BufferAttribute, Curve } from 'three';
import type { PathEdge, PathNode, Road } from '../../types';
import { PATH_NODES as DEFAULT_NODES, PATH_EDGES as DEFAULT_EDGES } from '../../data/recCampusData';
import { createSmoothPathFromNodes } from '../../utils/curvePath';

interface RoadsProps {
  edges?: PathEdge[];
  nodes?: PathNode[];
  roads?: Road[];
  selectedRoadId?: string | null;
  onSelectRoad?: (roadId: string) => void;
}

/**
 * Builds a smooth 3D road ribbon BufferGeometry along any 3D Curve.
 * Generates top asphalt surface with accurate curve normals and UVs.
 */
function createCurvedRoadGeometry(
  curve: Curve<Vector3>,
  roadWidth: number,
  roadHeight: number = 0.09
): BufferGeometry {
  const curveLength = curve.getLength();
  const numSteps = Math.max(16, Math.min(180, Math.round(curveLength / 2.0)));
  const halfW = roadWidth / 2;

  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  for (let i = 0; i <= numSteps; i++) {
    const t = i / numSteps;
    const pt = curve.getPointAt(t);
    const tan = curve.getTangentAt(t);

    // Normal perpendicular to curve tangent in the horizontal XZ plane
    let nx = tan.z;
    let nz = -tan.x;
    const len = Math.hypot(nx, nz) || 1;
    nx /= len;
    nz /= len;

    const yTop = (pt.y || 0) + roadHeight;

    // Left vertex
    positions.push(pt.x + nx * halfW, yTop, pt.z + nz * halfW);
    normals.push(0, 1, 0);
    uvs.push(0, t * (curveLength / 8));

    // Right vertex
    positions.push(pt.x - nx * halfW, yTop, pt.z - nz * halfW);
    normals.push(0, 1, 0);
    uvs.push(1, t * (curveLength / 8));
  }

  // Top surface quad indices
  for (let s = 0; s < numSteps; s++) {
    const a = s * 2;
    const b = s * 2 + 1;
    const c = (s + 1) * 2;
    const d = (s + 1) * 2 + 1;

    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geom.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geom.setIndex(indices);
  return geom;
}

/**
 * Builds curved center dashed stripes BufferGeometry along any 3D Curve.
 */
function createCurvedDashedGeometry(
  curve: Curve<Vector3>,
  dashLength: number = 3.2,
  gapLength: number = 2.4,
  stripeWidth: number = 0.45,
  elevation: number = 0.11
): BufferGeometry {
  const curveLength = curve.getLength();
  const cycle = dashLength + gapLength;
  const halfW = stripeWidth / 2;

  const positions: number[] = [];
  const indices: number[] = [];
  let baseIndex = 0;

  for (let dist = 0; dist + 0.5 < curveLength; dist += cycle) {
    const dEnd = Math.min(dist + dashLength, curveLength);
    if (dEnd - dist < 0.6) break;

    const subSteps = 3;
    for (let step = 0; step <= subSteps; step++) {
      const d = dist + (step / subSteps) * (dEnd - dist);
      const u = Math.min(1, Math.max(0, d / curveLength));
      const pt = curve.getPointAt(u);
      const tan = curve.getTangentAt(u);

      let nx = tan.z;
      let nz = -tan.x;
      const len = Math.hypot(nx, nz) || 1;
      nx /= len;
      nz /= len;

      const y = (pt.y || 0) + elevation;

      positions.push(pt.x + nx * halfW, y, pt.z + nz * halfW);
      positions.push(pt.x - nx * halfW, y, pt.z - nz * halfW);
    }

    for (let s = 0; s < subSteps; s++) {
      const a = baseIndex + s * 2;
      const b = baseIndex + s * 2 + 1;
      const c = baseIndex + (s + 1) * 2;
      const d = baseIndex + (s + 1) * 2 + 1;

      indices.push(a, b, c);
      indices.push(b, d, c);
    }
    baseIndex += (subSteps + 1) * 2;
  }

  const geom = new BufferGeometry();
  geom.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geom.setIndex(indices);
  geom.computeVertexNormals();
  return geom;
}

const CurvedRoadItem: React.FC<{
  road: Road;
  nodes: PathNode[];
  isSelected: boolean;
  onSelect?: (id: string) => void;
}> = ({ road, nodes, isSelected, onSelect }) => {
  const roadWidth = isSelected ? 12.5 : (road.width || 9.5);
  const roadHeight = isSelected ? 0.2 : 0.09;

  const { roadGeom, dashGeom } = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const pts: Vector3[] = [];
    for (const jId of road.junctionIds) {
      const n = nodeMap.get(jId);
      if (n) {
        pts.push(new Vector3(n.position.x, n.position.y || 0, n.position.z));
      }
    }
    if (pts.length < 2) {
      return { roadGeom: null, dashGeom: null };
    }

    // Filleted smooth path ensures straight centerlines with rounded corner arcs inside junction hubs
    const curve = createSmoothPathFromNodes(pts, 3.5, 0);
    if (!curve) {
      return { roadGeom: null, dashGeom: null };
    }

    const rG = createCurvedRoadGeometry(curve, roadWidth, roadHeight);
    const dG = createCurvedDashedGeometry(curve, 3.2, 2.4, 0.45, roadHeight + 0.02);

    return { roadGeom: rG, dashGeom: dG };
  }, [road, nodes, roadWidth, roadHeight]);

  if (!roadGeom) return null;

  return (
    <group
      onClick={(e) => {
        if (onSelect) {
          e.stopPropagation();
          onSelect(road.id);
        }
      }}
    >
      {/* Main Curved Road Surface */}
      <mesh geometry={roadGeom} receiveShadow>
        <meshStandardMaterial
          color={isSelected ? '#06B6D4' : '#334155'}
          emissive={isSelected ? '#0891B2' : '#000000'}
          emissiveIntensity={isSelected ? 0.8 : 0}
          roughness={isSelected ? 0.2 : 0.85}
        />
      </mesh>

      {/* Curved Center Dashed Line */}
      {dashGeom && (
        <mesh geometry={dashGeom}>
          <meshBasicMaterial
            color={isSelected ? '#E0F2FE' : '#94A3B8'}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
    </group>
  );
};

export const Roads: React.FC<RoadsProps> = ({
  edges = DEFAULT_EDGES,
  nodes = DEFAULT_NODES,
  roads = [],
  selectedRoadId,
  onSelectRoad,
}) => {
  // Set of node pair keys covered by any Road object
  const coveredEdgeKeys = useMemo(() => {
    const set = new Set<string>();
    for (const r of roads) {
      for (let i = 0; i < r.junctionIds.length - 1; i++) {
        const a = r.junctionIds[i];
        const b = r.junctionIds[i + 1];
        set.add(`${a}:::${b}`);
        set.add(`${b}:::${a}`);
      }
    }
    return set;
  }, [roads]);

  // Nodes actively participating in any road or edge for junction hub cylinders
  const activeJunctionNodes = useMemo(() => {
    const activeIds = new Set<string>();
    for (const r of roads) {
      for (const id of r.junctionIds) activeIds.add(id);
    }
    for (const e of edges) {
      activeIds.add(e.from);
      activeIds.add(e.to);
    }
    return nodes.filter(n => activeIds.has(n.id));
  }, [roads, edges, nodes]);

  // Edges not belonging to any road (rendered as direct ribbons)
  const standaloneEdges = useMemo(() => {
    return edges.filter(e => !coveredEdgeKeys.has(`${e.from}:::${e.to}`));
  }, [edges, coveredEdgeKeys]);

  return (
    <group>
      {/* 1. Curved Roads Rendered from Multi-Junction Road Definitions */}
      {roads.map(road => (
        <CurvedRoadItem
          key={road.id}
          road={road}
          nodes={nodes}
          isSelected={Boolean(selectedRoadId && road.id === selectedRoadId)}
          onSelect={onSelectRoad}
        />
      ))}

      {/* 2. Standalone Edges (if any edge is not yet bundled in a road) */}
      {standaloneEdges.map(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        if (!fromNode || !toNode) return null;

        const syntheticRoad: Road = {
          id: `edge-road-${edge.id}`,
          name: edge.roadName || 'Path',
          junctionIds: [edge.from, edge.to],
          width: 9.5,
        };

        return (
          <CurvedRoadItem
            key={edge.id}
            road={syntheticRoad}
            nodes={nodes}
            isSelected={false}
          />
        );
      })}

      {/* 3. Smooth Rounded Intersection Hubs at Junction Nodes */}
      {activeJunctionNodes.map(node => (
        <mesh
          key={`hub-${node.id}`}
          position={[node.position.x, 0.045, node.position.z]}
          receiveShadow
        >
          <cylinderGeometry args={[5.0, 5.0, 0.09, 24]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
};
