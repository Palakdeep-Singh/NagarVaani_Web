import { Request, Response } from 'express';
import { WelfareApplication } from '../models/welfare.model';

export const getWelfareApplications = async (req: Request, res: Response) => {
  try {
    const apps = await WelfareApplication.find();
    res.status(200).json(apps);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWelfareStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const app = await WelfareApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!app) {
      return res.status(404).json({ error: 'Welfare application not found' });
    }
    res.status(200).json(app);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
