import express from 'express';
import Officer from '../models/Officer.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';

const router = express.Router();

// Create a new officer (only allowed for higher roles like CEO, DEO)
router.post('/', requireAuth, requireRole(['CEO', 'DEO']), async (req, res) => {
  try {
    const officer = new Officer(req.body);
    await officer.save();
    res.status(201).json(officer);
  } catch (err) {
    console.error('Create officer error', err);
    res.status(400).json({ error: err.message });
  }
});

// Get officer by ID (any authenticated user can view)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const officer = await Officer.findById(req.params.id).populate('subordinates');
    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    res.json(officer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update officer (restricted to same role hierarchy)
router.put('/:id', requireAuth, requireRole(['CEO', 'DEO', 'RO', 'SO']), async (req, res) => {
  try {
    const officer = await Officer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!officer) return res.status(404).json({ error: 'Officer not found' });
    res.json(officer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete officer (only CEO/DEO)
router.delete('/:id', requireAuth, requireRole(['CEO', 'DEO']), async (req, res) => {
  try {
    const result = await Officer.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Officer not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
