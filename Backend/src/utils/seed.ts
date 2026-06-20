import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { Officer } from '../models/officer.model';

export const seedDatabase = async (): Promise<void> => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already seeded. Skipping seed step.');
      return;
    }

    console.log('Database empty. Starting seeding process...');

    // 1. Seed Users (Essential for login auth)
    const salt = await bcrypt.genSalt(10);
    const cmPassword = await bcrypt.hash('cm123', salt);
    const dmPassword = await bcrypt.hash('dm123', salt);
    const deptPassword = await bcrypt.hash('dept123', salt);

    await User.create([
      { username: 'cm', password: cmPassword, role: 'Chief Minister' },
      { username: 'newdelhidm', password: dmPassword, role: 'District Magistrate', district: 'New Delhi' },
      { username: 'healthhead', password: deptPassword, role: 'Department Head', department: 'Public Health' }
    ]);
    console.log('Seeded default accounts.');

    // 2. Seed Officers (Essential directory listing for calls & messages)
    const initialOfficers = [
      { id: 'OFF-001', name: 'Smt. Alice Vaz (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'New Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-002', name: 'Shri Amit Kumar (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'West Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-003', name: 'Smt. Cheshta Yadav (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'South Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-004', name: 'Shri Anil Bankar (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'Shahdara', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-005', name: 'Shri Vikram Singh (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'North East Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-006', name: 'Dr. Shalini Gupta', designation: 'Director Health Services', department: 'Health & Family Welfare', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-007', name: 'Shri Himanshu Gupta (IAS)', designation: 'Director of Education', department: 'Education Department', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-008', name: 'Er. R.K. Bhardwaj', designation: 'Chief Engineer', department: 'PWD & Infrastructure', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-009', name: 'Smt. Isha Khosla (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'Central Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-010', name: 'Shri Santosh Kumar (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'North West Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 },
      { id: 'OFF-011', name: 'Shri Pradeep Kumar (IAS)', designation: 'District Magistrate', department: 'Revenue & Grievance', district: 'East Delhi', resolutionRate: 100, avgResolutionTime: 0, activeComplaints: 0, completedComplaints: 0, rating: 5.0 }
    ];
    await Officer.create(initialOfficers);
    console.log('Seeded officers.');

    console.log('Database seeding completed successfully (Authentication and Directory profiles initialized)!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
