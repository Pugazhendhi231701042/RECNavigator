import React, { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location } from '../../types';

interface CameraControllerProps {
  selectedLocation: Location | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ selectedLocation, controlsRef }) => {
  const { camera } = useThree();
  const targetPos = React.useRef(new Vector3(0, 180, 260));
  const targetLookAt = React.useRef(new Vector3(0, 0, 0));
  const isAnimating = React.useRef(false);

  useEffect(() => {
    if (selectedLocation) {
      targetPos.current.set(
        selectedLocation.position.x,
        selectedLocation.position.y + 70,
        selectedLocation.position.z + 100
      );
      targetLookAt.current.set(
        selectedLocation.position.x,
        selectedLocation.position.y,
        selectedLocation.position.z
      );
      isAnimating.current = true;
    }
  }, [selectedLocation]);

  useFrame(() => {
    if (isAnimating.current) {
      camera.position.lerp(targetPos.current, 0.08);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        controlsRef.current.update();
      }

      // Stop Lerp animation when close enough to target
      if (camera.position.distanceTo(targetPos.current) < 1.0) {
        isAnimating.current = false;
      }
    }
  });

  return null;
};
