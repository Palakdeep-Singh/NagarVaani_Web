import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import User from '../models/User.js';
import Booth from '../models/Booth.js';
import AC from '../models/AC.js';
import Checklist from '../models/Checklist.js';
import Complaint from '../models/Complaint.js';
import Directive from '../models/Directive.js';
import Asset from '../models/Asset.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

const seedNewCollections = async () => {
  await connectDB();

  try {
    console.log('Clearing old Checklist, Complaint, Directive, Asset data...');
    await Checklist.deleteMany({});
    await Complaint.deleteMany({});
    await Directive.deleteMany({});
    await Asset.deleteMany({});

    // Fetch existing users and booths
    const ro = await User.findOne({ role: 'RO' });
    const so = await User.findOne({ role: 'SO' });
    const booths = await Booth.find().populate('presidingOfficerId');
    const ac = await AC.findOne({ acNumber: 40 });

    if (!ro || !so || booths.length === 0) {
      console.error('Required users or booths not found. Run seed-all.js first.');
      process.exit(1);
    }

    // ── Checklists ─────────────────────────────────────────────────────────
    console.log('Seeding Checklists...');
    const checklistDocs = [];
    const milestones = ['Mock Poll', 'Poll Started', 'EVM Sealed'];
    
    for (const booth of booths) {
      // For each booth, mock poll is completed, poll started is completed, EVM sealed is pending
      checklistDocs.push({
        boothId: booth._id,
        milestoneName: 'Mock Poll',
        status: 'Completed',
        completedAt: new Date(new Date().setHours(6, 30, 0, 0)),
        reportedBy: booth.presidingOfficerId
      });
      checklistDocs.push({
        boothId: booth._id,
        milestoneName: 'Poll Started',
        status: 'Completed',
        completedAt: new Date(new Date().setHours(7, 0, 0, 0)),
        reportedBy: booth.presidingOfficerId
      });
      checklistDocs.push({
        boothId: booth._id,
        milestoneName: 'EVM Sealed',
        status: 'Pending'
      });
    }
    await Checklist.insertMany(checklistDocs);

    // ── Complaints ─────────────────────────────────────────────────────────
    console.log('Seeding Complaints...');
    const complaintDocs = [
      {
        complaintCode: 'CMP-2026-001',
        citizenName: 'Rahul Verma',
        citizenContact: '9876543210',
        type: 'Bogus Voting',
        description: 'Suspicious individuals near Booth 102 claiming to vote twice.',
        boothId: booths.find(b => b.boothNumber === 102)?._id,
        acId: ac._id,
        status: 'Investigating',
        severity: 'High',
        assignedTo: so._id,
        resolutionTimeline: [
          { action: 'Reported', note: 'Received via Citizen App', timestamp: new Date(Date.now() - 3600000) },
          { action: 'Assigned', note: 'Assigned to Sector Officer 1', updatedBy: ro._id, timestamp: new Date(Date.now() - 3000000) }
        ]
      },
      {
        complaintCode: 'CMP-2026-002',
        citizenName: 'Anita Gupta',
        citizenContact: '9123456780',
        type: 'Law & Order',
        description: 'Argument broken out outside the polling station perimeter.',
        boothId: booths.find(b => b.boothNumber === 105)?._id,
        acId: ac._id,
        status: 'Open',
        severity: 'Critical',
        assignedTo: so._id,
        resolutionTimeline: [
          { action: 'Reported', note: 'Received via Control Room Call', timestamp: new Date(Date.now() - 1800000) }
        ]
      }
    ];
    await Complaint.insertMany(complaintDocs);

    // ── Directives ─────────────────────────────────────────────────────────
    console.log('Seeding Directives...');
    const directiveDocs = [
      {
        senderId: ro._id,
        targetAudience: 'All SOs',
        messageText: 'Ensure all booths under your sector report 11 AM turnout strictly by 11:15 AM.',
        priority: 'High',
        acknowledgments: []
      },
      {
        senderId: so._id,
        targetAudience: 'Specific Booth',
        targetBoothId: booths.find(b => b.boothNumber === 104)?._id,
        messageText: 'Reserve EVM dispatched to your location. ETA 15 mins.',
        priority: 'SOS',
        acknowledgments: []
      }
    ];
    await Directive.insertMany(directiveDocs);

    // ── Assets (EVMs) ──────────────────────────────────────────────────────
    console.log('Seeding Assets (EVMs)...');
    const assetDocs = [];
    
    // Seed assets for booths
    for (const booth of booths) {
      // Control Unit
      assetDocs.push({
        assetId: `CU-${booth.boothCode}`,
        assetType: 'Control Unit',
        status: 'Deployed',
        currentLocation: { type: 'Booth', boothId: booth._id, acId: ac._id },
        batteryLevel: Math.floor(Math.random() * 20) + 80, // 80-99%
        assignedTo: booth.presidingOfficerId,
        movementLogs: [{ action: 'Allocated to Booth', note: 'Scanned at Dispatch Center' }]
      });
      // Ballot Unit
      assetDocs.push({
        assetId: `BU-${booth.boothCode}`,
        assetType: 'Ballot Unit',
        status: 'Deployed',
        currentLocation: { type: 'Booth', boothId: booth._id, acId: ac._id },
        assignedTo: booth.presidingOfficerId,
        movementLogs: [{ action: 'Allocated to Booth', note: 'Scanned at Dispatch Center' }]
      });
    }

    // Seed some Reserve EVMs for the Sector
    assetDocs.push({
      assetId: 'CU-RES-001',
      assetType: 'Control Unit',
      status: 'In Transit',
      currentLocation: { type: 'Sector Reserve', acId: ac._id },
      batteryLevel: 100,
      assignedTo: so._id,
      movementLogs: [{ action: 'Dispatched', note: 'Moving to Booth 104 as replacement' }]
    });
    assetDocs.push({
      assetId: 'CU-RES-002',
      assetType: 'Control Unit',
      status: 'In Warehouse',
      currentLocation: { type: 'Warehouse', acId: ac._id },
      batteryLevel: 100,
      movementLogs: []
    });

    await Asset.insertMany(assetDocs);

    console.log('\n✅ New Collections Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedNewCollections();
