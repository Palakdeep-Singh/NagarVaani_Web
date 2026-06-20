import { Response } from 'express';
import { DigitalFile } from '../models/file.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getFiles = async (req: AuthRequest, res: Response) => {
  try {
    const files = await DigitalFile.find().sort({ updatedAt: -1 });
    res.status(200).json(files);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarkText } = req.body;

    if (!remarkText) {
      return res.status(400).json({ error: 'Remark text is required for approval.' });
    }

    const file = await DigitalFile.findOne({ id });
    if (!file) {
      return res.status(404).json({ error: 'File tracking record not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Determine author name from req.user context
    let authorName = 'Chief Minister';
    if (req.user?.role === 'District Magistrate') {
      authorName = `${req.user.district} DM`;
    } else if (req.user?.role === 'Department Head') {
      authorName = req.user.department || 'Department Head';
    }

    const nextStep = file.currentStep + 1;
    const isFinished = nextStep >= file.totalSteps;

    file.remarks.push({
      author: authorName,
      action: 'Approved & Signed',
      text: remarkText,
      date: todayStr
    });

    file.currentStep = isFinished ? file.currentStep : nextStep;
    file.currentOwner = isFinished ? 'Archived (Approved)' : file.path[nextStep];
    file.status = isFinished ? 'Approved' : 'Pending Approval';

    await file.save();
    res.status(200).json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const rejectFile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { remarkText } = req.body;

    if (!remarkText) {
      return res.status(400).json({ error: 'Remark text is required for rejection.' });
    }

    const file = await DigitalFile.findOne({ id });
    if (!file) {
      return res.status(404).json({ error: 'File tracking record not found.' });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // Determine author name from req.user context
    let authorName = 'Chief Minister';
    if (req.user?.role === 'District Magistrate') {
      authorName = `${req.user.district} DM`;
    } else if (req.user?.role === 'Department Head') {
      authorName = req.user.department || 'Department Head';
    }

    file.remarks.push({
      author: authorName,
      action: 'Rejected',
      text: remarkText,
      date: todayStr
    });

    file.status = 'Rejected';
    file.currentOwner = 'Archived (Rejected)';

    await file.save();
    res.status(200).json(file);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
