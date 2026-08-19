export interface AssetManifestEntry {
  id: string;
  name: string;
  glbPath: string;
  isVerifiedModel: boolean; // true = load custom GLB model file
  description: string;
}

export const ASSET_MANIFEST: Record<string, AssetManifestEntry> = {
  'terrain': {
    id: 'terrain',
    name: 'REC Campus Ground & Lawns',
    glbPath: '/assets/campus/terrain.glb',
    isVerifiedModel: false,
    description: 'Ground terrain mesh with green grass lawns, tree groves, and campus boundary.',
  },
  'roads': {
    id: 'roads',
    name: 'REC Main Roads & Paved Walks',
    glbPath: '/assets/campus/roads.glb',
    isVerifiedModel: false,
    description: 'Asphalt main roads and paved pedestrian pathways.',
  },
  'block-a': {
    id: 'block-a',
    name: 'Block A (Academic & Admin)',
    glbPath: '/assets/campus/block-a.glb',
    isVerifiedModel: true,
    description: '4-Story academic building housing CSE, IT, and ECE departments.',
  },
  'block-b': {
    id: 'block-b',
    name: 'Block B (Engineering Block)',
    glbPath: '/assets/campus/block-b.glb',
    isVerifiedModel: true,
    description: 'U-shaped 4-story engineering building housing Mechanical and EEE.',
  },
  'block-c': {
    id: 'block-c',
    name: 'Block C (Biotech & Science)',
    glbPath: '/assets/campus/block-c.glb',
    isVerifiedModel: false,
    description: 'Biotech and General Sciences academic building.',
  },
  'block-d': {
    id: 'block-d',
    name: 'Block D (Management & Humanities)',
    glbPath: '/assets/campus/block-d.glb',
    isVerifiedModel: true, // Enabled custom GLB model
    description: 'MBA and Placement cell building.',
  },
  'rec-cafe': {
    id: 'rec-cafe',
    name: 'REC Central Cafeteria',
    glbPath: '/assets/campus/rec-cafe.glb',
    isVerifiedModel: true,
    description: 'Central multi-cuisine cafeteria building.',
  },
  'hut-cafe': {
    id: 'hut-cafe',
    name: 'Hut Café',
    glbPath: '/assets/campus/hut-cafe.glb',
    isVerifiedModel: false,
    description: 'Open-air aesthetic coffee and snack pavilion.',
  },
  'dominos': {
    id: 'dominos',
    name: 'Food Square (Domino\'s & Blackbucks)',
    glbPath: '/assets/campus/dominos.glb',
    isVerifiedModel: true,
    description: 'Food square kiosk building.',
  },
  'sports-ground': {
    id: 'sports-ground',
    name: 'Main Sports Stadium',
    glbPath: '/assets/campus/sports-ground.glb',
    isVerifiedModel: false,
    description: '400m running track and football field turf.',
  },
  'auditorium': {
    id: 'auditorium',
    name: 'Indoor Auditorium',
    glbPath: '/assets/campus/auditorium.glb',
    isVerifiedModel: false,
    description: '3000+ seat indoor auditorium and convention hall.',
  },
  'girls-hostel': {
    id: 'girls-hostel',
    name: 'Girls Hostel Complex',
    glbPath: '/assets/campus/girls-hostel.glb',
    isVerifiedModel: false,
    description: 'Hostel residential complex Blocks 1, 2, 3.',
  },
};
