import express from 'express';
import { hierarchyData } from '../utils/mockHierarchyData.js';

const router = express.Router();

// Get the full list of officers
router.get('/officers', (req, res) => {
  res.json(hierarchyData.officers);
});

// Get direct subordinates of a specific officer
router.get('/officers/:id/subordinates', (req, res) => {
  const { id } = req.params;
  const subordinates = hierarchyData.officers.filter(o => o.parentId === id);
  res.json(subordinates);
});

// Get voters for a specific booth (PRO id)
router.get('/voters/:boothId', (req, res) => {
  const { boothId } = req.params;
  const voters = hierarchyData.voters.filter(v => v.boothId === boothId);
  res.json(voters);
});

export default router;
