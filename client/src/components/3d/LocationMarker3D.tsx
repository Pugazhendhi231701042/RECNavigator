import React from 'react';
import type { Location } from '../../types';
import { Html } from '@react-three/drei';
import { MapPin, Navigation } from 'lucide-react';

interface LocationMarker3DProps {
  locations: Location[];
  selectedLocation: Location | null;
  startLocation: Location | null;
  destinationLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  showLabels: boolean;
}

export const LocationMarker3D: React.FC<LocationMarker3DProps> = ({
  locations,
  selectedLocation,
  startLocation,
  destinationLocation,
  onSelectLocation,
  showLabels,
}) => {
  return (
    <group>
      {locations.map(loc => {
        const isStart = startLocation?.id === loc.id;
        const isDest = destinationLocation?.id === loc.id;
        const isSelected = selectedLocation?.id === loc.id;

        // Position pin 14m above building base
        const pinPos: [number, number, number] = [loc.position.x, loc.position.y + 14, loc.position.z];

        return (
          <group key={loc.id} position={pinPos}>
            {/* HTML Anchored Pin Overlay */}
            <Html center distanceFactor={250}>
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(loc);
                }}
                className="cursor-pointer select-none transition-transform duration-200 hover:scale-125 group"
              >
                {/* START LOCATION PIN (GREEN A) */}
                {isStart && (
                  <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-emerald-500/30 animate-bounce">
                    A
                  </div>
                )}

                {/* DESTINATION PIN (RED B) */}
                {isDest && (
                  <div className="w-9 h-9 rounded-full bg-red-600 text-white font-extrabold text-xs flex items-center justify-center shadow-2xl border-2 border-white ring-4 ring-red-600/30 animate-bounce">
                    B
                  </div>
                )}

                {/* SELECTED PIN (GOLD) */}
                {isSelected && !isStart && !isDest && (
                  <div className="w-8 h-8 rounded-full bg-rec-gold text-slate-900 font-extrabold text-xs flex items-center justify-center shadow-xl border-2 border-white animate-pulse">
                    <MapPin className="w-4 h-4 fill-slate-900" />
                  </div>
                )}

                {/* 3D LOCATION TEXT LABEL (TOGGLEABLE) */}
                {showLabels && !isStart && !isDest && !isSelected && (
                  <div className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white rounded-lg text-[11px] font-bold shadow-lg border border-slate-700 whitespace-nowrap flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Navigation className="w-3 h-3 text-rec-gold" />
                    {loc.name}
                  </div>
                )}
              </div>
            </Html>
          </group>
        );
      })}
    </group>
  );
};
