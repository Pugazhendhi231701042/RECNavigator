export type CategoryId = 
  | 'academic'
  | 'food'
  | 'hostel'
  | 'sports'
  | 'parking'
  | 'entrance'
  | 'admin'
  | 'services';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  description: string;
  color: string;
}

export interface Vector3D {
  x: number;
  y: number; // Elevation height above terrain
  z: number;
}

export interface Location {
  id: string;
  name: string;
  category: CategoryId;
  description?: string;
  position: Vector3D; // 3D world position in meters
  rotationY?: number; // Y-axis rotation angle in degrees or radians
  rotation?: [number, number, number]; // [rx, ry, rz]
  scale?: [number, number, number];
  modelKey?: string; // Key in assetManifest
  image?: string;
  tags?: string[];
  aliases?: string[];
  facilities?: string[];
  block?: string;
  floorCount?: number;
  nodeId: string; // Associated navigation graph node
  isPlaceholder?: boolean;
}

export interface PathNode {
  id: string;
  name: string;
  position: Vector3D;
}

export interface PathEdge {
  id: string;
  from: string;
  to: string;
  distance: number; // distance in meters
  roadName?: string;
}

export interface RouteStep {
  stepNumber: number;
  instruction: string;
  distance: number;
  landmark?: string;
}

export interface RouteResult {
  distance: number; // meters
  walkingTime: number; // minutes
  pathNodeIds: string[];
  nodes: PathNode[];
  edges: PathEdge[];
  steps: RouteStep[];
}
