import { Request, Response } from 'express';
import { HealthBed, HealthInventory, SchoolSmartBoard, GeneralMetric } from '../models/metrics.model';

export const getHealthBeds = async (req: Request, res: Response) => {
  try {
    const beds = await HealthBed.find();
    res.status(200).json(beds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getHealthInventory = async (req: Request, res: Response) => {
  try {
    const inventory = await HealthInventory.find();
    res.status(200).json(inventory);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSchoolSmartBoards = async (req: Request, res: Response) => {
  try {
    const smartboards = await SchoolSmartBoard.find();
    res.status(200).json(smartboards);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGeneralMetrics = async (req: Request, res: Response) => {
  try {
    const metricsList = await GeneralMetric.find();
    const metricsMap = metricsList.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.status(200).json(metricsMap);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
