import React, { useRef } from 'react';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, RouteResult } from '../../types';
import { CampusScene } from '../3d/CampusScene';

interface CampusMapProps {
  locations: Location[];
  selectedLocation: Location | null;
  onSelectLocation: (loc: Location) => void;
  activeRoute: RouteResult | null;
  startLocation: Location | null;
  destinationLocation: Location | null;
  showLabels?: boolean;
}

export const CampusMap: React.FC<CampusMapProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  activeRoute,
  startLocation,
  destinationLocation,
  showLabels = true,
}) => {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <CampusScene
      locations={locations}
      selectedLocation={selectedLocation}
      onSelectLocation={onSelectLocation}
      activeRoute={activeRoute}
      startLocation={startLocation}
      destinationLocation={destinationLocation}
      showLabels={showLabels}
      controlsRef={controlsRef}
    />
  );
};
