import { Schema, model } from 'mongoose';

// Health ICU Beds
export interface IHealthBed {
  hospital: string;
  total: number;
  occupied: number;
  status: 'Stable' | 'Critical' | 'Emergency';
}

const healthBedSchema = new Schema<IHealthBed>({
  hospital: { type: String, required: true },
  total: { type: Number, required: true },
  occupied: { type: Number, required: true },
  status: { type: String, enum: ['Stable', 'Critical', 'Emergency'], required: true }
});

export const HealthBed = model<IHealthBed>('HealthBed', healthBedSchema);

// Health Medicine Stocks
export interface IHealthInventory {
  item: string;
  status: 'Safe' | 'Restocking' | 'Critical Shortage';
  stockLevel: string;
  demand: 'Low' | 'Medium' | 'High' | 'Urgent';
}

const healthInventorySchema = new Schema<IHealthInventory>({
  item: { type: String, required: true },
  status: { type: String, enum: ['Safe', 'Restocking', 'Critical Shortage'], required: true },
  stockLevel: { type: String, required: true },
  demand: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], required: true }
});

export const HealthInventory = model<IHealthInventory>('HealthInventory', healthInventorySchema);

// Education Smart Boards
export interface ISchoolSmartBoard {
  school: string;
  zone: string;
  boards: string;
  progress: number;
  status: 'Completed' | 'Active' | 'Delayed';
}

const schoolSmartBoardSchema = new Schema<ISchoolSmartBoard>({
  school: { type: String, required: true },
  zone: { type: String, required: true },
  boards: { type: String, required: true },
  progress: { type: Number, required: true },
  status: { type: String, enum: ['Completed', 'Active', 'Delayed'], required: true }
});

export const SchoolSmartBoard = model<ISchoolSmartBoard>('SchoolSmartBoard', schoolSmartBoardSchema);

// Generic Metrics for single KPI values
export interface IGeneralMetric {
  key: string;
  value: string;
}

const generalMetricSchema = new Schema<IGeneralMetric>({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true }
});

export const GeneralMetric = model<IGeneralMetric>('GeneralMetric', generalMetricSchema);
