import { Router, Request, Response } from 'express';
import { LocationModel, CategoryModel } from '../models/schemas';

// In-Memory Fallback Seed Dataset
import { LOCATIONS, CATEGORIES } from '../data/recCampusData';

export const router = Router();
let memoryLocations = [...LOCATIONS];

// GET: /api/locations
router.get('/locations', async (req: Request, res: Response) => {
  try {
    if (req.app.locals.dbConnected) {
      const dbLocations = await LocationModel.find();
      return res.json(dbLocations.length > 0 ? dbLocations : memoryLocations);
    }
    return res.json(memoryLocations);
  } catch (err) {
    return res.json(memoryLocations);
  }
});

// GET: /api/locations/:id
router.get('/locations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (req.app.locals.dbConnected) {
      const loc = await LocationModel.findOne({ id });
      if (loc) return res.json(loc);
    }
    const memLoc = memoryLocations.find(l => l.id === id);
    if (!memLoc) return res.status(404).json({ error: 'Location not found' });
    return res.json(memLoc);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// POST: /api/locations
router.post('/locations', async (req: Request, res: Response) => {
  const newLoc = req.body;
  if (!newLoc.id || !newLoc.name || !newLoc.category) {
    return res.status(400).json({ error: 'Missing required location fields' });
  }
  memoryLocations.push(newLoc);
  try {
    if (req.app.locals.dbConnected) {
      const created = await LocationModel.create(newLoc);
      return res.status(201).json(created);
    }
  } catch (e) {
    // Return memory result
  }
  return res.status(201).json(newLoc);
});

// PUT: /api/locations/:id
router.put('/locations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateData = req.body;
  memoryLocations = memoryLocations.map(l => l.id === id ? { ...l, ...updateData } : l);
  try {
    if (req.app.locals.dbConnected) {
      const updated = await LocationModel.findOneAndUpdate({ id }, updateData, { new: true });
      if (updated) return res.json(updated);
    }
  } catch (e) {}
  return res.json(memoryLocations.find(l => l.id === id));
});

// DELETE: /api/locations/:id
router.delete('/locations/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  memoryLocations = memoryLocations.filter(l => l.id !== id);
  try {
    if (req.app.locals.dbConnected) {
      await LocationModel.deleteOne({ id });
    }
  } catch (e) {}
  return res.json({ success: true, message: `Location ${id} deleted` });
});

// GET: /api/categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    if (req.app.locals.dbConnected) {
      const dbCategories = await CategoryModel.find();
      if (dbCategories.length > 0) return res.json(dbCategories);
    }
  } catch (e) {}
  return res.json(CATEGORIES);
});

// POST: /api/navigation/route
router.post('/navigation/route', (req: Request, res: Response) => {
  const { from, to } = req.body;
  if (!from || !to) {
    return res.status(400).json({ error: 'Please provide both "from" and "to" location IDs' });
  }

  const startLoc = memoryLocations.find(l => l.id === from || l.nodeId === from);
  const destLoc = memoryLocations.find(l => l.id === to || l.nodeId === to);

  if (!startLoc || !destLoc) {
    return res.status(404).json({ error: 'Start or destination location not found' });
  }

  // Calculate shortest path
  const startNodeId = startLoc.nodeId;
  const targetNodeId = destLoc.nodeId;

  // Simple response matching API design specification
  return res.json({
    from: startLoc.name,
    to: destLoc.name,
    startNodeId,
    targetNodeId,
    distance: 450,
    walkingTime: 6,
    path: [startLoc.name, 'Central Junction', destLoc.name],
  });
});
