import React, { useMemo, Suspense, Component, useRef } from 'react';
import { useGLTF, TransformControls, Line, Html } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { ASSET_MANIFEST } from '../../data/assetManifest';
import type { Location, Vector3D, PathNode } from '../../types';

interface BuildingsProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  onDoubleClickLocation?: (loc: Location) => void;
  subdued?: boolean;
  transformMode?: 'translate' | 'rotate' | 'scale' | null;
  onTransformChange?: (newPos: Vector3D, newRotY: number, newScale: number) => void;
  onTransformStart?: () => void;
  onTransformEnd?: () => void;
  nodes?: PathNode[];
}

// Error Boundary for GLB Model Loading
class GLBErrorBoundary extends Component<{ fallback: React.ReactNode; children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("⚠️ GLB Model failed to parse or load. Rendering procedural fallback.", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component that loads GLB via useGLTF with Auto-Centering and Ground Bounding
function GLBModel({
  url,
  onClick,
  onDoubleClick,
  scale = 1,
}: {
  url: string;
  onClick: (e: any) => void;
  onDoubleClick?: (e: any) => void;
  scale?: number;
}) {
  const { scene } = useGLTF(url);

  const autoCenteredScene = useMemo(() => {
    const clone = scene.clone(true);

    const box = new Box3().setFromObject(clone);
    const center = new Vector3();
    const size = new Vector3();
    box.getCenter(center);
    box.getSize(size);

    clone.position.x -= center.x;
    clone.position.y -= box.min.y;
    clone.position.z -= center.z;

    return clone;
  }, [scene, url]);

  return (
    <group onClick={onClick} onDoubleClick={onDoubleClick} scale={[scale, scale, scale]}>
      <primitive object={autoCenteredScene} />
    </group>
  );
}

// Procedural Fallback Building Geometry
function ProceduralBuilding({
  loc,
  color,
  onClick,
  onDoubleClick,
}: {
  loc: Location;
  color: string;
  onClick: (e: any) => void;
  onDoubleClick?: (e: any) => void;
}) {
  return (
    <group onClick={onClick} onDoubleClick={onDoubleClick}>
      {/* Block A (Long Horizontal Academic Block) */}
      {loc.id === 'block-a' && (
        <group>
          <mesh position={[0, 8, 0]}>
            <boxGeometry args={[120, 16, 30]} />
            <meshStandardMaterial color={color} roughness={0.4} metalness={0.1} />
          </mesh>
          <mesh position={[0, 16.5, 0]}>
            <boxGeometry args={[116, 1, 26]} />
            <meshStandardMaterial color="#0F2C59" />
          </mesh>
        </group>
      )}

      {/* Block B (U-Shaped Engineering Block) */}
      {loc.id === 'block-b' && (
        <group>
          <mesh position={[0, 8, -20]}>
            <boxGeometry args={[90, 16, 20]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[-35, 8, 10]}>
            <boxGeometry args={[20, 16, 40]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[35, 8, 10]}>
            <boxGeometry args={[20, 16, 40]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
        </group>
      )}

      {/* Block C */}
      {loc.id === 'block-c' && (
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[40, 12, 50]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      )}

      {/* Block D */}
      {loc.id === 'block-d' && (
        <mesh position={[0, 6, 0]}>
          <boxGeometry args={[40, 12, 50]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      )}

      {/* REC Cafe */}
      {loc.id === 'rec-cafe' && (
        <group>
          <mesh position={[0, 4, 0]}>
            <boxGeometry args={[40, 8, 30]} />
            <meshStandardMaterial color={color} roughness={0.3} />
          </mesh>
          <mesh position={[0, 8.5, 0]}>
            <coneGeometry args={[22, 3, 4]} />
            <meshStandardMaterial color="#B45309" />
          </mesh>
        </group>
      )}

      {/* Hut Cafe */}
      {loc.id === 'hut-cafe' && (
        <group>
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[12, 14, 6, 16]} />
            <meshStandardMaterial color={color} roughness={0.4} />
          </mesh>
          <mesh position={[0, 7, 0]}>
            <coneGeometry args={[16, 4, 16]} />
            <meshStandardMaterial color="#D97706" />
          </mesh>
        </group>
      )}

      {/* Domino's & Blackbucks */}
      {loc.id === 'dominos' && (
        <mesh position={[0, 3.5, 0]}>
          <boxGeometry args={[30, 7, 20]} />
          <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
      )}

      {/* Main Sports Ground Oval Track & Turf */}
      {loc.id === 'sports-ground' && (
        <group>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[110, 150]} />
            <meshBasicMaterial color="#C53030" />
          </mesh>
          <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[80, 120]} />
            <meshBasicMaterial color="#2F855A" />
          </mesh>
        </group>
      )}

      {/* Indoor Auditorium */}
      {loc.id === 'indoor-auditorium' && (
        <group>
          <mesh position={[0, 9, 0]}>
            <boxGeometry args={[50, 18, 50]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
          </mesh>
          <mesh position={[0, 18.5, 0]}>
            <sphereGeometry args={[26, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#3730A3" metalness={0.5} roughness={0.2} />
          </mesh>
        </group>
      )}

      {/* Main Gate Security Arch */}
      {loc.id === 'main-gate' && (
        <group>
          <mesh position={[-12, 6, 0]}>
            <boxGeometry args={[4, 12, 4]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[12, 6, 0]}>
            <boxGeometry args={[4, 12, 4]} />
            <meshStandardMaterial color="#1E293B" />
          </mesh>
          <mesh position={[0, 13, 0]}>
            <boxGeometry args={[30, 3, 6]} />
            <meshStandardMaterial color="#DC2626" />
          </mesh>
        </group>
      )}

      {/* Flagpole */}
      {loc.id === 'flagpole' && (
        <group>
          <mesh position={[0, 12, 0]}>
            <cylinderGeometry args={[0.3, 0.5, 24]} />
            <meshStandardMaterial color="#E2E8F0" metalness={0.8} />
          </mesh>
          <mesh position={[2, 22, 0]}>
            <boxGeometry args={[4, 2.5, 0.2]} />
            <meshStandardMaterial color="#FF9933" />
          </mesh>
        </group>
      )}

      {/* Generic Building Fallback */}
      {!['block-a', 'block-b', 'block-c', 'block-d', 'rec-cafe', 'hut-cafe', 'dominos', 'sports-ground', 'indoor-auditorium', 'main-gate', 'flagpole'].includes(loc.id) && (
        <mesh position={[0, 5, 0]}>
          <boxGeometry args={[30, 10, 30]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      )}
    </group>
  );
}

interface BuildingItemProps {
  loc: Location;
  isSelected: boolean;
  subdued?: boolean;
  transformMode?: 'translate' | 'rotate' | 'scale' | null;
  onSelect: (loc: Location) => void;
  onDoubleClick?: (loc: Location) => void;
  onTransformChange?: (newPos: Vector3D, newRotY: number, newScale: number) => void;
  onTransformStart?: () => void;
  onTransformEnd?: () => void;
  entranceNodes: PathNode[];
}

function BuildingItem({
  loc,
  isSelected,
  subdued,
  transformMode,
  onSelect,
  onDoubleClick,
  onTransformChange,
  onTransformStart,
  onTransformEnd,
  entranceNodes,
}: BuildingItemProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const groupRef = useRef<any>(null);

  const manifestEntry = loc.modelKey
    ? ASSET_MANIFEST[loc.modelKey] || {
        id: loc.modelKey,
        name: loc.modelKey,
        glbPath: `/assets/campus/${loc.modelKey}`,
        isVerifiedModel: true,
        description: loc.modelKey,
      }
    : null;
  const useGLB = manifestEntry && manifestEntry.isVerifiedModel && !subdued;

  const color = subdued
    ? '#475569'
    : isSelected
      ? '#38BDF8'
      : loc.category === 'academic'
        ? '#1E40AF'
        : loc.category === 'food'
          ? '#D97706'
          : loc.category === 'hostel'
            ? '#6D28D9'
            : loc.category === 'sports'
              ? '#059669'
              : loc.category === 'entrance'
                ? '#DC2626'
                : '#0284C7';

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(loc);
  };

  const handleDoubleClick = (e: any) => {
    e.stopPropagation();
    onDoubleClick?.(loc);
  };

  const fallback = (
    <ProceduralBuilding
      loc={loc}
      color={color}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    />
  );
  const rotYRad = ((loc.rotationY || 0) * Math.PI) / 180;
  const glbUrl = manifestEntry ? `${baseUrl}${manifestEntry.glbPath}`.replace(/\/+/g, '/') : '';
  const scaleVec: [number, number, number] = Array.isArray(loc.scale)
    ? loc.scale
    : typeof loc.scale === 'number'
      ? [loc.scale, loc.scale, loc.scale]
      : [1, 1, 1];

  const content = (
    <group
      ref={groupRef}
      position={[loc.position.x, loc.position.y, loc.position.z]}
      rotation={[0, rotYRad, 0]}
      scale={scaleVec}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {useGLB ? (
        <GLBErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GLBModel
              url={glbUrl}
              onClick={handleClick}
              onDoubleClick={handleDoubleClick}
            />
          </Suspense>
        </GLBErrorBoundary>
      ) : (
        fallback
      )}

      {/* Selected Building Ground Highlight Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
          <ringGeometry args={[18, 21, 36]} />
          <meshBasicMaterial color="#38BDF8" toneMapped={false} />
        </mesh>
      )}
    </group>
  );

  const isDraggingRef = useRef(false);
  const lastThrottleTime = useRef(0);

  const handleGizmoMouseDown = () => {
    isDraggingRef.current = true;
    onTransformStart?.();
  };

  const handleGizmoMouseUp = () => {
    isDraggingRef.current = false;
    onTransformEnd?.();
    if (groupRef.current && onTransformChange) {
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      const sc = groupRef.current.scale;
      const deg = Math.round((rot.y * 180) / Math.PI);
      onTransformChange(
        { x: Math.round(pos.x), y: Number(pos.y.toFixed(1)), z: Math.round(pos.z) },
        (deg % 360 + 360) % 360,
        Number(sc.x.toFixed(2))
      );
    }
  };

  const handleGizmoChange = () => {
    if (!groupRef.current || !onTransformChange || !isDraggingRef.current) return;
    const now = performance.now();
    // Throttle React state sync during active dragging to keep 60fps render loop butter-smooth
    if (now - lastThrottleTime.current > 60) {
      lastThrottleTime.current = now;
      const pos = groupRef.current.position;
      const rot = groupRef.current.rotation;
      const sc = groupRef.current.scale;
      const deg = Math.round((rot.y * 180) / Math.PI);
      onTransformChange(
        { x: Math.round(pos.x), y: Number(pos.y.toFixed(1)), z: Math.round(pos.z) },
        (deg % 360 + 360) % 360,
        Number(sc.x.toFixed(2))
      );
    }
  };

  return (
    <>
      {content}

      {/* 3D Transform Gizmo direct manipulation — smooth continuous control */}
      {isSelected && transformMode && groupRef.current && (
        <TransformControls
          object={groupRef}
          mode={transformMode}
          size={0.85}
          onMouseDown={handleGizmoMouseDown}
          onMouseUp={handleGizmoMouseUp}
          onChange={handleGizmoChange}
        />
      )}

      {/* Entrance Connector Lines for Selected Building */}
      {isSelected && entranceNodes.length > 0 && (
        <group>
          {entranceNodes.map(node => (
            <group key={`ent-line-${loc.id}-${node.id}`}>
              <Line
                points={[
                  [loc.position.x, 0.3, loc.position.z],
                  [node.position.x, 0.3, node.position.z],
                ]}
                color="#10B981"
                lineWidth={3}
                dashed
                dashScale={4}
                dashSize={1}
                gapSize={0.6}
              />
              <Html
                position={[
                  (loc.position.x + node.position.x) / 2,
                  1.5,
                  (loc.position.z + node.position.z) / 2,
                ]}
                center
                distanceFactor={100}
              >
                <div className="bg-emerald-950/90 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/60 shadow-md whitespace-nowrap pointer-events-none">
                  🚪 Entrance Link
                </div>
              </Html>
            </group>
          ))}
        </group>
      )}
    </>
  );
}

export const Buildings: React.FC<BuildingsProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onDoubleClickLocation,
  subdued = false,
  transformMode = null,
  onTransformChange,
  onTransformStart,
  onTransformEnd,
  nodes = [],
}) => {
  return (
    <group>
      {locations.map(loc => {
        const isSelected = selectedLocation?.id === loc.id;
        
        // Find entrance nodes for this building
        const entranceIds = (loc.entranceNodeIds && loc.entranceNodeIds.length > 0)
          ? loc.entranceNodeIds
          : [loc.nodeId];
        const entranceNodes = nodes.filter(n => entranceIds.includes(n.id));

        return (
          <BuildingItem
            key={loc.id}
            loc={loc}
            isSelected={isSelected}
            subdued={subdued}
            transformMode={isSelected ? transformMode : null}
            onSelect={onSelectLocation}
            onDoubleClick={onDoubleClickLocation}
            onTransformChange={onTransformChange}
            onTransformStart={onTransformStart}
            onTransformEnd={onTransformEnd}
            entranceNodes={entranceNodes}
          />
        );
      })}
    </group>
  );
};
