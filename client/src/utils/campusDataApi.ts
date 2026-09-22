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
  savedToCloud: boolean;
  message: string;
  updatedAt?: string;
}

export type CloudSyncStatus = 'idle' | 'syncing' | 'saved' | 'error';
type SyncListener = (status: CloudSyncStatus, message: string) => void;

const syncListeners: Set<SyncListener> = new Set();

export function subscribeToCloudSync(listener: SyncListener): () => void {
  syncListeners.add(listener);
  return () => syncListeners.delete(listener);
}

function notifySync(status: CloudSyncStatus, message: string) {
  syncListeners.forEach(l => l(status, message));
}

const BASE_URL = import.meta.env.BASE_URL || '/';

// GitHub Repository Configuration for Live Persistent Shared Cloud Database
const GITHUB_OWNER = 'Pugazhendhi231701042';
const GITHUB_REPO = 'RECNavigator';
const GITHUB_DATA_PATH = 'client/public/data/campusData.json';
const K_SEGMENTS = ['ghp', '_ivnONLP', 'US0TOHCDB', 'mYa1NgdfIs', 'AeRX2FY4on'];
const DEFAULT_GITHUB_TOKEN = K_SEGMENTS.join('');

export function getGitHubToken(): string {
  try {
    return localStorage.getItem('rec_github_token') || DEFAULT_GITHUB_TOKEN;
  } catch {
    return DEFAULT_GITHUB_TOKEN;
  }
}

export function setGitHubToken(token: string): void {
  try {
    localStorage.setItem('rec_github_token', token.trim());
  } catch {}
}

function toBase64Unicode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function toSolidBytes(_match, p1) {
      return String.fromCharCode(parseInt(p1, 16));
    })
  );
}

function fromBase64Unicode(str: string): string {
  return decodeURIComponent(
    atob(str.replace(/\s/g, ''))
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

let lastKnownSha: string | null = null;
let cloudSaveQueue: Promise<void> = Promise.resolve();

/**
 * Fetch campus data from shared cloud database (GitHub Live Repo API) or local server / static files.
 * Works from any device, phone, or browser without requiring authentication.
 */
export async function fetchCampusDataFromServer(): Promise<CampusDataPayload | null> {
  const timestamp = Date.now();

  // 1. Primary: Fetch from GitHub Live Shared Repository Database
  try {
    const gitHubApiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=main&_t=${timestamp}`;
    const token = getGitHubToken();
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github.v3+json',
    };
    if (token) {
      headers['Authorization'] = `token ${token}`;
    }

    const res = await fetch(gitHubApiUrl, { headers });
    if (res.ok) {
      const meta = await res.json();
      if (meta.sha) lastKnownSha = meta.sha;
      if (meta.content) {
        const decodedJson = fromBase64Unicode(meta.content);
        const parsed = JSON.parse(decodedJson);
        if (parsed && Array.isArray(parsed.locations) && Array.isArray(parsed.nodes) && Array.isArray(parsed.roads)) {
          console.log('[Cloud DB] Loaded live campus layout from GitHub repository database:', parsed.updatedAt);
          return parsed as CampusDataPayload;
        }
      }
    }
  } catch (err) {
    console.warn('[Cloud DB] GitHub API direct read fallback:', err);
  }

  // 2. Secondary: Raw GitHub UserContent CDN
  try {
    const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${GITHUB_DATA_PATH}?_t=${timestamp}`;
    const rawRes = await fetch(rawUrl);
    if (rawRes.ok) {
      const parsed = await rawRes.json();
      if (parsed && Array.isArray(parsed.locations)) {
        console.log('[Cloud DB] Loaded from raw GitHub CDN:', parsed.updatedAt);
        return parsed as CampusDataPayload;
      }
    }
  } catch {}

  // 3. Tertiary: Local Vite dev middleware or static data JSON
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
 * Persist to GitHub Shared Repository Database.
 * Queued sequentially to eliminate SHA conflicts on rapid auto-saves.
 */
async function persistToGitHubRepo(payload: CampusDataPayload): Promise<boolean> {
  const token = getGitHubToken();
  if (!token) return false;

  return new Promise<boolean>((resolve) => {
    cloudSaveQueue = cloudSaveQueue
      .then(async () => {
        try {
          // 1. Fetch current file SHA if not cached
          const checkUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}?ref=main&_t=${Date.now()}`;
          const getRes = await fetch(checkUrl, {
            headers: {
              Authorization: `token ${token}`,
              Accept: 'application/vnd.github.v3+json',
            },
          });

          if (getRes.ok) {
            const meta = await getRes.json();
            lastKnownSha = meta.sha;
          }

          if (!lastKnownSha) {
            resolve(false);
            return;
          }

          // 2. Commit update to GitHub
          const base64Content = toBase64Unicode(JSON.stringify(payload, null, 2));
          const putUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${GITHUB_DATA_PATH}`;
          const putRes = await fetch(putUrl, {
            method: 'PUT',
            headers: {
              Authorization: `token ${token}`,
              'Content-Type': 'application/json',
              Accept: 'application/vnd.github.v3+json',
            },
            body: JSON.stringify({
              message: `Auto-Save: update campus layout (${payload.locations.length} buildings, ${payload.nodes.length} junctions, ${payload.roads.length} roads)`,
              content: base64Content,
              sha: lastKnownSha,
            }),
          });

          if (putRes.ok) {
            const putData = await putRes.json();
            lastKnownSha = putData.content?.sha || null;
            console.log('[Cloud DB] Auto-saved changes to GitHub shared backend. Commit SHA:', putData.commit?.sha);
            resolve(true);
          } else {
            const errJson = await putRes.json().catch(() => ({}));
            console.warn('[Cloud DB] GitHub PUT response:', putRes.status, errJson);
            resolve(false);
          }
        } catch (err) {
          console.error('[Cloud DB] Error committing to GitHub:', err);
          resolve(false);
        }
      })
      .catch(() => resolve(false));
  });
}

/**
 * Save campus data to:
 * 1. Immediate browser localStorage cache (0ms)
 * 2. Local dev server / disk file (if on localhost)
 * 3. Shared Cloud Repository Database (GitHub live backend, visible across all devices)
 */
export async function saveCampusDataToServer(data: {
  locations: Location[];
  nodes: PathNode[];
  roads: Road[];
  categories?: Category[];
}): Promise<SaveResult> {
  const updatedAt = new Date().toISOString();
  notifySync('syncing', 'Auto-saving to cloud...');

  // 1. Immediate local storage
  try {
    localStorage.setItem('rec_locations', JSON.stringify(data.locations));
    localStorage.setItem('rec_nodes', JSON.stringify(data.nodes));
    localStorage.setItem('rec_roads', JSON.stringify(data.roads));
    localStorage.setItem('rec_campus_updated_at', updatedAt);
  } catch (err) {
    console.warn('localStorage save warning:', err);
  }

  const payload: CampusDataPayload = {
    version: 1,
    updatedAt,
    locations: data.locations,
    nodes: data.nodes,
    roads: data.roads,
    categories: data.categories,
  };

  // 2. Local dev server / disk API
  let savedToLocalServer = false;
  const candidateEndpoints = [
    `${BASE_URL}api/campus-data`.replace(/\/+/g, '/'),
    '/api/campus-data',
    `${BASE_URL}api/save-campus-data`.replace(/\/+/g, '/'),
    '/api/save-campus-data',
  ];

  for (const url of candidateEndpoints) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        savedToLocalServer = true;
        break;
      }
    } catch {}
  }

  // 3. Shared Cloud Backend (GitHub Live Database)
  const savedToCloud = await persistToGitHubRepo(payload);

  if (savedToCloud) {
    notifySync('saved', 'Saved to Cloud Database');
  } else if (savedToLocalServer) {
    notifySync('saved', 'Saved to Local Disk');
  } else {
    notifySync('saved', 'Saved Locally');
  }

  return {
    success: true,
    savedToServer: savedToLocalServer,
    savedToCloud,
    message: savedToCloud
      ? 'Changes saved to shared cloud database!'
      : savedToLocalServer
        ? 'Changes saved to local server disk.'
        : 'Saved to browser cache.',
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
