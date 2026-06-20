import { Response } from 'express';
import { Complaint } from '../models/complaint.model';
import { Officer } from '../models/officer.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    // For local flexibility, return all complaints. The frontend will filter them dynamically.
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { title, category, description, priority, district, department, citizenName, citizenPhone, ward } = req.body;

    if (!title || !category || !description || !district || !department || !citizenName || !citizenPhone) {
      return res.status(400).json({ error: 'All primary complaint fields are required.' });
    }

    // Generate unique ID in the format GRV-2026-0XXX
    const count = await Complaint.countDocuments();
    const formattedId = `GRV-2026-0${count + 13}`;
    const todayStr = new Date().toISOString().split('T')[0];

    const newComplaint = await Complaint.create({
      id: formattedId,
      title,
      category,
      description,
      status: 'Pending',
      priority: priority || 'Medium',
      district,
      department,
      citizenName,
      citizenPhone,
      dateFiled: todayStr,
      ward,
      timeline: [
        { date: todayStr, action: 'Grievance Registered', actor: 'Portal Intake' }
      ]
    });

    // Update activeComplaints count for matching officers
    await Officer.updateMany(
      { district },
      { $inc: { activeComplaints: 1 } }
    );
    await Officer.updateMany(
      { department, district: { $exists: false } },
      { $inc: { activeComplaints: 1 } }
    );

    res.status(201).json(newComplaint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComplaintStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, remarkText, actor } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const complaint = await Complaint.findOne({ id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    const originalStatus = complaint.status;
    const todayStr = new Date().toISOString().split('T')[0];

    complaint.status = status;
    complaint.timeline.push({
      date: todayStr,
      action: `Status updated to ${status}`,
      actor: actor || req.user?.role || 'System',
      notes: remarkText
    });

    await complaint.save();

    // If resolved and wasn't resolved before, update officer resolution rates and ratings
    if (status === 'Resolved' && originalStatus !== 'Resolved') {
      const officers = await Officer.find({
        $or: [
          { district: complaint.district },
          { department: complaint.department, district: { $exists: false } }
        ]
      });

      for (const off of officers) {
        const completed = off.completedComplaints + 1;
        const active = Math.max(0, off.activeComplaints - 1);
        const rate = Math.round((completed / (completed + active)) * 100);
        
        let ratingBoost = off.district ? 0.1 : 0.05;
        const newRating = Math.min(5, Number((off.rating + ratingBoost).toFixed(2)));

        off.completedComplaints = completed;
        off.activeComplaints = active;
        off.resolutionRate = rate;
        off.rating = newRating;
        await off.save();
      }
    }

    res.status(200).json(complaint);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
