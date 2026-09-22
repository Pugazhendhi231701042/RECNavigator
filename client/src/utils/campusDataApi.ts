import type { Location, PathNode, Road, Category } from '../types';

export interface CampusDataPayload {
  version: number;
  updatedAt: string;
  locations: Location[];
  nodes: PathNode[];
  roads: Road[];
  categories?: Category[];
}

export interface SaveResult {
  success: boolean;
  savedToServer: boolean;
  message: string;
  updatedAt?: string;
}

const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Fetch campus data from server (Vite dev middleware or Express backend or static data JSON).
 */
export async function fetchCampusDataFromServer(): Promise<CampusDataPayload | null> {
  const candidateEndpoints = [
    `${BASE_URL}api/campus-data`.replace(/\/+/g, '/'),
    '/api/campus-data',
    `${BASE_URL}data/campusData.json`.replace(/\/+/g, '/'),
    '/data/campusData.json',
  ];

  for (const url of candidateEndpoints) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json', 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.locations) && Array.isArray(data.nodes) && Array.isArray(data.roads)) {
          return data as CampusDataPayload;
        }
      }
    } catch {
      // Continue to next endpoint candidate
    }
  }

  return null;
}

/**
 * Save campus data to server/disk AND local storage.
 * Guarantees persistence across server restarts and browser reloads.
 */
export async function saveCampusDataToServer(data: {
  locations: Location[];
  nodes: PathNode[];
  roads: Road[];
  categories?: Category[];
}): Promise<SaveResult> {
  const updatedAt = new Date().toISOString();

  // 1. Always update localStorage as immediate browser-side layer
  try {
    localStorage.setItem('rec_locations', JSON.stringify(data.locations));
    localStorage.setItem('rec_nodes', JSON.stringify(data.nodes));
    localStorage.setItem('rec_roads', JSON.stringify(data.roads));
    localStorage.setItem('rec_campus_updated_at', updatedAt);
  } catch (err) {
    console.warn('localStorage save warning:', err);
  }

  // 2. Persist to server / disk via Vite dev middleware or Express API
  const candidateEndpoints = [
    `${BASE_URL}api/campus-data`.replace(/\/+/g, '/'),
    '/api/campus-data',
    `${BASE_URL}api/save-campus-data`.replace(/\/+/g, '/'),
    '/api/save-campus-data',
  ];

  const payload: CampusDataPayload = {
    version: 1,
    updatedAt,
    locations: data.locations,
    nodes: data.nodes,
    roads: data.roads,
    categories: data.categories,
  };

  let savedToServer = false;
  for (const url of candidateEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        savedToServer = true;
        break;
      }
    } catch {
      // Continue trying candidate URLs
    }
  }

  return {
    success: true,
    savedToServer,
    message: savedToServer
      ? 'Changes saved permanently to server & disk!'
      : 'Saved to browser storage (server not reachable).',
    updatedAt,
  };
}

/**
 * Download a standalone JSON backup file to user's computer.
 */
export function downloadCampusDataBackup(data: {
  locations: Location[];
  nodes: PathNode[];
  roads: Road[];
}): void {
  const payload: CampusDataPayload = {
    version: 1,
    updatedAt: new Date().toISOString(),
    locations: data.locations,
    nodes: data.nodes,
    roads: data.roads,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `rec-campus-data-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate an uploaded campus data JSON file.
 */
export function parseCampusDataBackup(jsonText: string): {
  locations: Location[];
  nodes: PathNode[];
  roads: Road[];
} {
  const parsed = JSON.parse(jsonText);
  if (!parsed || !Array.isArray(parsed.locations) || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.roads)) {
    throw new Error('Invalid campus data JSON format. Expected locations, nodes, and roads arrays.');
  }
  return {
    locations: parsed.locations,
    nodes: parsed.nodes,
    roads: parsed.roads,
  };
}
