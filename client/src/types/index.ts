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
  scale?: [number, number, number] | number;
  modelKey?: string; // Key in assetManifest
  image?: string;
  tags?: string[];
  aliases?: string[];
  facilities?: string[];
  block?: string;
  floorCount?: number;
  nodeId: string; // Primary associated navigation graph node
  entranceNodeIds?: string[]; // All entrance junctions for this building
  entrances?: Entrance[]; // Explicit entrances with custom names & junction mapping
  isPlaceholder?: boolean;
}

export interface Entrance {
  id: string;
  name: string; // e.g., "Main Front Entrance", "East Wing Gate", "Emergency Exit"
  buildingId: string;
  junctionId: string; // Associated navigation graph node
  position?: Vector3D; // Optional coordinate on map
}

export interface Road {
  id: string;
  name: string;
  junctionIds: string[]; // Ordered sequence of junction IDs forming this road
  segmentDistances?: Record<string, number>; // Authoritative manual distances (key: "nodeA:::nodeB") in meters
  width?: number; // Road mesh width in meters (default: 10m)
  color?: string;
  description?: string;
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
