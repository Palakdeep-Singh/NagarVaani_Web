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

export const bulkImportOfficers = async (req: AuthRequest, res: Response) => {
  try {
    const rows: { Name: string; Designation: string; Department: string; District?: string }[] = req.body.officers;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No officer records provided' });
    }

    // Get current highest ID to continue sequence
    const existing = await Officer.find({}).select('id').lean();
    let maxNum = 0;
    for (const o of existing) {
      const match = o.id?.match(/^OFF-(\d+)$/);
      if (match) {
        const n = parseInt(match[1], 10);
        if (n > maxNum) maxNum = n;
      }
    }

    const toInsert: any[] = [];
    const skipped: string[] = [];

    for (const row of rows) {
      const name = row.Name?.trim();
      const designation = row.Designation?.trim();
      const department = row.Department?.trim();
      const district = row.District?.trim() || undefined;

      if (!name || !designation || !department) {
        skipped.push(name || '(unnamed)');
        continue;
      }

      maxNum++;
      const id = `OFF-${String(maxNum).padStart(3, '0')}`;
      toInsert.push({
        id,
        name,
        designation,
        department,
        district,
        resolutionRate: 80,
        avgResolutionTime: 5.0,
        activeComplaints: 0,
        completedComplaints: 0,
        rating: 4.0
      });
    }

    const inserted = await Officer.insertMany(toInsert);
    res.status(201).json({ inserted: inserted.length, skipped });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
