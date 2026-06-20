import { Response } from 'express';
import { Project } from '../models/project.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title, department, budgetAllocated, startDate, endDate, manager, description } = req.body;

    if (!title || !department || !budgetAllocated || !startDate || !endDate || !manager || !description) {
      return res.status(400).json({ error: 'All project fields are required.' });
    }

    const count = await Project.countDocuments();
    const formattedId = `PRJ-DEL-${count + 106}`;

    const newProject = await Project.create({
      id: formattedId,
      title,
      department,
      budgetAllocated,
      budgetSpent: 0,
      physicalProgress: 0,
      startDate,
      endDate,
      status: 'On Track',
      manager,
      description
    });

    res.status(201).json(newProject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProjectProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    if (progress === undefined) {
      return res.status(400).json({ error: 'Progress value is required.' });
    }

    const project = await Project.findOne({ id });
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const currentProgress = project.physicalProgress;
    const budgetAllocated = project.budgetAllocated;
    const currentSpent = project.budgetSpent;

    const budgetDelta = Math.round((progress - currentProgress) * (budgetAllocated / 100) * 0.95);
    const newSpent = Math.min(budgetAllocated, currentSpent + Math.max(0, budgetDelta));

    let computedStatus = status || project.status;
    if (progress >= 100) {
      computedStatus = 'Completed';
    } else if (progress > currentProgress && computedStatus === 'Critical') {
      computedStatus = 'On Track';
    }

    project.physicalProgress = Math.min(100, progress);
    project.budgetSpent = newSpent;
    project.status = computedStatus;

    await project.save();
    res.status(200).json(project);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
