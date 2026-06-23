import express from 'express';
import Officer from '../models/Officer.js';
import ElectoralRoll from '../models/ElectoralRoll.js';

const router = express.Router();

// Get the full list of officers (real data)
router.get('/officers', async (req, res) => {
  try {
    const officers = await Officer.find().lean();
    res.json(officers);
  } catch (err) {
    console.error('Error fetching officers', err);
    res.status(500).json({ error: 'Failed to fetch officers' });
  }
});

// Graph endpoint with voter counts per officer (based on booth assignments)
router.get('/graph', async (req, res) => {
  try {
    // Count voters per booth
    const voterCounts = await ElectoralRoll.aggregate([
      { $group: { _id: '$boothId', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    voterCounts.forEach(vc => {
      countMap[vc._id?.toString()] = vc.count;
    });

    // Fetch officers with hierarchy fields
    const officers = await Officer.find().lean();
    const nodes = officers.map(off => {
      let voterCount = 0;
      if (off.role === 'Presiding Officer' && off.boothId) {
        voterCount = countMap[off.boothId.toString()] || 0;
      }
      return { id: off._id.toString(), label: off.name, role: off.role, voterCount };
    });
    const links = officers
      .filter(o => o.parentId)
      .map(o => ({ source: o.parentId.toString(), target: o._id.toString() }));
    res.json({ nodes, links });
  } catch (err) {
    console.error('Error building hierarchy graph', err);
    res.status(500).json({ error: 'Failed to build graph' });
  }
});

// Get direct subordinates of a specific officer
router.get('/officers/:id/subordinates', async (req, res) => {
  try {
    const subs = await Officer.find({ parentId: req.params.id }).lean();
    res.json(subs);
  } catch (err) {
    console.error('Error fetching subordinates', err);
    res.status(500).json({ error: 'Failed to fetch subordinates' });
  }
});

// Get voters for a specific booth (PRO id)
router.get('/voters/:boothId', async (req, res) => {
  try {
    const voters = await ElectoralRoll.find({ boothId: req.params.boothId }).lean();
    res.json(voters);
  } catch (err) {
    console.error('Error fetching voters for booth', err);
    res.status(500).json({ error: 'Failed to fetch voters' });
  }
});

export default router;
