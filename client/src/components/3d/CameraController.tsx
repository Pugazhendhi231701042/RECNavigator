import React, { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Location, Vector3D } from '../../types';

interface CameraControllerProps {
  focusLocation?: Location | null;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  cameraMode?: 'perspective' | 'top';
  targetPoint?: Vector3D | null;
}

export const CameraController: React.FC<CameraControllerProps> = ({
  focusLocation,
  controlsRef,
  cameraMode = 'perspective',
  targetPoint,
}) => {
  const { camera, gl } = useThree();
  const targetPos = useRef(new Vector3(0, 180, 260));
  const targetLookAt = useRef(new Vector3(0, 0, 0));
  const isAnimating = useRef(false);

  // Immediately stop animation if user clicks, drags, or wheels with the mouse
  useEffect(() => {
    const dom = gl.domElement;
    const handleUserInteract = () => {
      isAnimating.current = false;
    };

    dom.addEventListener('pointerdown', handleUserInteract);
    dom.addEventListener('wheel', handleUserInteract, { passive: true });

    return () => {
      dom.removeEventListener('pointerdown', handleUserInteract);
      dom.removeEventListener('wheel', handleUserInteract);
    };
  }, [gl]);

  // Respond to cameraMode changes (Top View vs Perspective 3D Orbit)
  useEffect(() => {
    const focusX = focusLocation?.position.x ?? targetPoint?.x ?? 0;
    const focusY = focusLocation?.position.y ?? targetPoint?.y ?? 0;
    const focusZ = focusLocation?.position.z ?? targetPoint?.z ?? 0;

    if (cameraMode === 'top') {
      targetPos.current.set(focusX, 360, focusZ + 0.001); // slight offset to prevent gimbal lock
      targetLookAt.current.set(focusX, 0, focusZ);
      if (controlsRef.current) {
        controlsRef.current.maxPolarAngle = 0.05;
        controlsRef.current.minPolarAngle = 0;
      }
    } else {
      targetPos.current.set(focusX, 180, focusZ + 240);
      targetLookAt.current.set(focusX, focusY, focusZ);
      if (controlsRef.current) {
        controlsRef.current.maxPolarAngle = Math.PI / 2 - 0.05;
        controlsRef.current.minPolarAngle = 0;
      }
    }
    isAnimating.current = true;
  }, [cameraMode, controlsRef]);

  // Zoom to building ONLY when double-clicked (focusLocation changes) or targetPoint changes
  useEffect(() => {
    if (focusLocation) {
      const { x, y, z } = focusLocation.position;
      if (cameraMode === 'top') {
        targetPos.current.set(x, 360, z + 0.001);
        targetLookAt.current.set(x, 0, z);
      } else {
        targetPos.current.set(x, y + 80, z + 120);
        targetLookAt.current.set(x, y, z);
      }
      isAnimating.current = true;
    } else if (targetPoint) {
      const { x, y, z } = targetPoint;
      if (cameraMode === 'top') {
        targetPos.current.set(x, 360, z + 0.001);
        targetLookAt.current.set(x, 0, z);
      } else {
        targetPos.current.set(x, y + 80, z + 120);
        targetLookAt.current.set(x, y, z);
      }
      isAnimating.current = true;
    }
  }, [focusLocation, targetPoint, cameraMode]);

  useFrame(() => {
    if (isAnimating.current) {
      camera.position.lerp(targetPos.current, 0.08);

      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, 0.08);
        controlsRef.current.update();
      }

      if (camera.position.distanceTo(targetPos.current) < 1.0) {
        isAnimating.current = false;
      }
    }
  });

  return null;
};
