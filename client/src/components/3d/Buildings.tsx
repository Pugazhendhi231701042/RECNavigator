import React, { useMemo, Suspense, Component } from 'react';
import { useGLTF } from '@react-three/drei';
import { Box3, Vector3 } from 'three';
import { ASSET_MANIFEST } from '../../data/assetManifest';
import type { Location } from '../../types';

interface BuildingsProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
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
function GLBModel({ url, onClick, scale = 1 }: { url: string; onClick: (e: any) => void; scale?: number }) {
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
    <group onClick={onClick} scale={[scale, scale, scale]}>
      <primitive object={autoCenteredScene} />
    </group>
  );
}

// Procedural Fallback Building Geometry
function ProceduralBuilding({ loc, color, onClick }: { loc: Location; color: string; onClick: (e: any) => void }) {
  return (
    <group onClick={onClick}>
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

export const Buildings: React.FC<BuildingsProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
}) => {
  const baseUrl = import.meta.env.BASE_URL || '/';

  return (
    <group>
      {locations.map(loc => {
        const isSelected = selectedLocation?.id === loc.id;
        const color = isSelected ? '#3B82F6' : (
          loc.category === 'academic' ? '#1E40AF' :
          loc.category === 'food' ? '#D97706' :
          loc.category === 'hostel' ? '#6D28D9' :
          loc.category === 'sports' ? '#059669' :
          loc.category === 'entrance' ? '#DC2626' : '#0284C7'
        );

        const manifestEntry = loc.modelKey ? ASSET_MANIFEST[loc.modelKey] : null;
        const useGLB = manifestEntry && manifestEntry.isVerifiedModel;

        const handleClick = (e: any) => {
          e.stopPropagation();
          onSelectLocation(loc);
        };

        const fallback = <ProceduralBuilding loc={loc} color={color} onClick={handleClick} />;
        
        const rotYRad = ((loc.rotationY || 0) * Math.PI) / 180;
        const glbUrl = manifestEntry ? `${baseUrl}${manifestEntry.glbPath}`.replace(/\/+/g, '/') : '';

        return (
          <group
            key={loc.id}
            position={[loc.position.x, loc.position.y, loc.position.z]}
            rotation={[0, rotYRad, 0]}
          >
            {useGLB ? (
              <GLBErrorBoundary fallback={fallback}>
                <Suspense fallback={fallback}>
                  <GLBModel url={glbUrl} onClick={handleClick} />
                </Suspense>
              </GLBErrorBoundary>
            ) : (
              fallback
            )}
          </group>
        );
      })}
    </group>
  );
};
