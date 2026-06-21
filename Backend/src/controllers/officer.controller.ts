import { Response } from 'express';
import { Officer } from '../models/officer.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getOfficers = async (req: AuthRequest, res: Response) => {
  try {
    const officers = await Officer.find().sort({ rating: -1 });
    res.status(200).json(officers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
