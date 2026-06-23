import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import District from '../models/District.js';
import AC from '../models/AC.js';
import User from '../models/User.js';
import Booth from '../models/Booth.js';
import ElectionDay from '../models/ElectionDay.js';
import Incident from '../models/Incident.js';

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

const districtsData = [
  { districtCode: 'ND', name: 'North Delhi', totalACs: 8 },
  { districtCode: 'SD', name: 'South Delhi', totalACs: 8 },
  { districtCode: 'ED', name: 'East Delhi', totalACs: 7 },
  { districtCode: 'WD', name: 'West Delhi', totalACs: 8 },
  { districtCode: 'CD', name: 'Central Delhi', totalACs: 5 },
  { districtCode: 'NEWD', name: 'New Delhi', totalACs: 3 },
  { districtCode: 'NWD', name: 'North West Delhi', totalACs: 10 },
  { districtCode: 'SWD', name: 'South West Delhi', totalACs: 8 },
  { districtCode: 'NED', name: 'North East Delhi', totalACs: 5 },
  { districtCode: 'SHD', name: 'Shahdara', totalACs: 4 },
  { districtCode: 'SED', name: 'South East Delhi', totalACs: 4 }
];

const acsData = [
  { acNumber: 1,  acName: 'Narela',        districtCode: 'ND' },
  { acNumber: 4,  acName: 'Bawana',        districtCode: 'ND' },
  { acNumber: 8,  acName: 'Burari',        districtCode: 'ND' },
  { acNumber: 23, acName: 'Chandni Chowk', districtCode: 'CD' },
  { acNumber: 40, acName: 'New Delhi',     districtCode: 'NEWD' },
  { acNumber: 45, acName: 'Dwarka',        districtCode: 'SWD' },
  { acNumber: 53, acName: 'Okhla',         districtCode: 'SED' },
  { acNumber: 54, acName: 'Trilokpuri',    districtCode: 'ED' },
  { acNumber: 63, acName: 'Mustafabad',    districtCode: 'NED' },
  { acNumber: 70, acName: 'Tughlakabad',   districtCode: 'SD' }
];

// Rich booth metadata for 12 booths in Sector 1, AC-40
const boothsMeta = [
  { num: 101, code: 'AC40-B101', name: 'Primary School Room 1',       ward: 'Ward-01', type: 'Normal',   total: 1205, evm: { battery: 95, status: 'Operational' } },
  { num: 102, code: 'AC40-B102', name: 'Primary School Room 2',       ward: 'Ward-01', type: 'Normal',   total: 1150, evm: { battery: 92, status: 'Operational' } },
  { num: 103, code: 'AC40-B103', name: 'Community Center Hall A',     ward: 'Ward-02', type: 'Sensitive', total: 1450, evm: { battery: 88, status: 'Operational' } },
  { num: 104, code: 'AC40-B104', name: 'Government High School Wd 4', ward: 'Ward-04', type: 'Critical',  total: 1380, evm: { battery: 12, status: 'EVM Fault'   } },
  { num: 105, code: 'AC40-B105', name: 'Panchayat Ghar Room 1',       ward: 'Ward-05', type: 'Normal',   total: 1020, evm: { battery: 97, status: 'Operational' } },
  { num: 106, code: 'AC40-B106', name: 'Panchayat Ghar Room 2',       ward: 'Ward-05', type: 'Normal',   total: 1080, evm: { battery: 90, status: 'Operational' } },
  { num: 107, code: 'AC40-B107', name: 'Vikas Bhawan Reception',      ward: 'Ward-06', type: 'Normal',   total: 1250, evm: { battery: 85, status: 'Operational' } },
  { num: 108, code: 'AC40-B108', name: 'Girls College Lobby',         ward: 'Ward-07', type: 'Normal',   total: 1312, evm: { battery: 24, status: 'Battery Low' } },
  { num: 109, code: 'AC40-B109', name: 'Town Hall East Wing',         ward: 'Ward-08', type: 'Normal',   total: 1190, evm: { battery: 94, status: 'Operational' } },
  { num: 110, code: 'AC40-B110', name: 'MCD School Hall B',           ward: 'Ward-09', type: 'Urban',    total: 1280, evm: { battery: 96, status: 'Operational' } },
  { num: 111, code: 'AC40-B111', name: 'Civil Hospital Room 4',       ward: 'Ward-10', type: 'Normal',   total: 1100, evm: { battery: 89, status: 'Operational' } },
  { num: 112, code: 'AC40-B112', name: 'Veterinary Clinic Annex',     ward: 'Ward-11', type: 'Rural',    total: 1145, evm: { battery: 91, status: 'Operational' } },
];

// Telemetry state for each booth — voted count, queue, visit status
const boothTelemetry = {
  101: { voted: 578,  queueCount: 12, waitMin: 8,  visitStatus: 'Visited', visitTime: '08:15 AM', gpsVerified: true,  sectorStatus: 'Healthy' },
  102: { voted: 667,  queueCount: 18, waitMin: 12, visitStatus: 'Visited', visitTime: '08:42 AM', gpsVerified: true,  sectorStatus: 'Healthy' },
  103: { voted: 594,  queueCount: 130,waitMin: 55, visitStatus: 'Pending', visitTime: null,        gpsVerified: false, sectorStatus: 'Long Queue' },
  104: { voted: 304,  queueCount: 14, waitMin: 10, visitStatus: 'Visited', visitTime: '09:05 AM', gpsVerified: true,  sectorStatus: 'EVM Fault' },
  105: { voted: 500,  queueCount: 8,  waitMin: 5,  visitStatus: 'Pending', visitTime: null,        gpsVerified: false, sectorStatus: 'Not Visited' },
  106: { voted: 561,  queueCount: 10, waitMin: 7,  visitStatus: 'Visited', visitTime: '09:35 AM', gpsVerified: true,  sectorStatus: 'Healthy' },
  107: { voted: 387,  queueCount: 65, waitMin: 35, visitStatus: 'Pending', visitTime: null,        gpsVerified: false, sectorStatus: 'Turnout Delay' },
  108: { voted: 498,  queueCount: 15, waitMin: 12, visitStatus: 'Pending', visitTime: null,        gpsVerified: false, sectorStatus: 'EVM Fault' },
  109: { voted: 535,  queueCount: 9,  waitMin: 6,  visitStatus: 'Pending', visitTime: null,        gpsVerified: false, sectorStatus: 'Not Visited' },
  110: { voted: 640,  queueCount: 11, waitMin: 8,  visitStatus: 'Visited', visitTime: '10:12 AM', gpsVerified: true,  sectorStatus: 'Healthy' },
  111: { voted: 583,  queueCount: 7,  waitMin: 5,  visitStatus: 'Visited', visitTime: '10:40 AM', gpsVerified: true,  sectorStatus: 'Healthy' },
  112: { voted: 538,  queueCount: 6,  waitMin: 4,  visitStatus: 'Visited', visitTime: '11:15 AM', gpsVerified: true,  sectorStatus: 'Healthy' },
};

const seedData = async () => {
  await connectDB();

  try {
    console.log('Clearing old data...');
    await District.deleteMany({});
    await AC.deleteMany({});
    await User.deleteMany({});
    await Booth.deleteMany({});
    await ElectionDay.deleteMany({});
    await Incident.deleteMany({});

    // ── Districts ────────────────────────────────────────────────────────────
    console.log('Seeding Districts...');
    const districtDocs = await District.insertMany(districtsData);
    const districtMap = {};
    districtDocs.forEach(d => { districtMap[d.districtCode] = d._id; });

    // ── ACs ──────────────────────────────────────────────────────────────────
    console.log('Seeding ACs...');
    const acDocs = await AC.insertMany(
      acsData.map(ac => ({ ...ac, districtId: districtMap[ac.districtCode] }))
    );
    const acNewDelhi = acDocs.find(ac => ac.acNumber === 40);
    const districtNewDelhi = districtMap['NEWD'];

    // ── Officers (Users) ─────────────────────────────────────────────────────
    console.log('Seeding Users (Officers)...');
    const eci = await User.create({ userId: 'ECI-001', employeeId: 'ECI-001', role: 'ECI', name: 'Chief Election Commissioner', jurisdictionLevel: 0, hierarchyPath: [] });
    const ceo = await User.create({ userId: 'CEO-DL-01', employeeId: 'CEO-DL-01', role: 'CEO', name: 'CEO Delhi', jurisdictionLevel: 1, parentId: eci._id, hierarchyPath: [eci._id] });
    const deo = await User.create({ userId: 'DEO-NEWD-01', employeeId: 'DEO-NEWD-01', role: 'DEO', name: 'DEO New Delhi', jurisdictionLevel: 2, assignedDistrict: 'New Delhi', parentId: ceo._id, hierarchyPath: [eci._id, ceo._id] });
    const ro  = await User.create({ userId: 'RO-AC40', employeeId: 'RO-AC40', role: 'RO', name: 'RO AC-40 New Delhi', jurisdictionLevel: 3, assignedDistrict: 'New Delhi', assignedAC: 'AC-40 New Delhi', parentId: deo._id, hierarchyPath: [eci._id, ceo._id, deo._id] });
    const so  = await User.create({ userId: 'SO-AC40-1', employeeId: 'SO-AC40-1', role: 'SO', name: 'Sector Officer 1 – AC40', jurisdictionLevel: 4, assignedDistrict: 'New Delhi', assignedAC: 'AC-40 New Delhi', assignedSector: 'Sector-1', parentId: ro._id, hierarchyPath: [eci._id, ceo._id, deo._id, ro._id] });

    // ── Booths + ElectionDay telemetry ────────────────────────────────────────
    console.log('Seeding 12 Booths + ElectionDay telemetry...');
    const boothDocs = [];
    const electionDocs = [];

    for (const meta of boothsMeta) {
      const tele = boothTelemetry[meta.num];
      const voted = tele.voted;
      const total = meta.total;
      const pct = Math.round((voted / total) * 100);

      // Create PRO for each booth
      const pro = await User.create({
        userId: `PRO-B${meta.num}`,
        employeeId: `PRO-B${meta.num}`,
        role: 'PRO',
        name: `Presiding Officer – Booth ${meta.num}`,
        jurisdictionLevel: 5,
        assignedDistrict: 'New Delhi',
        assignedAC: 'AC-40 New Delhi',
        assignedSector: 'Sector-1',
        parentId: so._id,
        hierarchyPath: [eci._id, ceo._id, deo._id, ro._id, so._id]
      });

      const booth = await Booth.create({
        boothNumber: meta.num,
        boothCode: meta.code,
        acId: acNewDelhi._id,
        sectorId: 'Sector-1',
        presidingOfficerId: pro._id,
        boothType: meta.type,
        location: { buildingName: meta.name, ward: meta.ward },
        totalVotersRegistered: total,
        evm: {
          cuSerial: `CU-${meta.code}`,
          buSerial: `BU-${meta.code}`,
          vvpatSerial: `VV-${meta.code}`,
          status: meta.evm.status,
          batteryLevel: meta.evm.battery,
          lastChecked: new Date()
        },
        isActive: true
      });

      const ed = await ElectionDay.create({
        boothId: booth._id,
        acId: acNewDelhi._id,
        districtId: districtNewDelhi,
        electionDate: new Date('2026-06-21'),
        phase: 1,
        pollingStatus: 'In Progress',
        openingTime: new Date('2026-06-21T07:00:00'),
        currentTurnout: { voted, percentage: pct, lastUpdated: new Date() },
        turnoutLog: [
          { time: new Date('2026-06-21T09:00:00'), votersVoted: Math.round(voted * 0.3), reportedAt: new Date() },
          { time: new Date('2026-06-21T11:00:00'), votersVoted: voted, reportedAt: new Date() }
        ],
        queueStatus: { count: tele.queueCount, estimatedWait: tele.waitMin, lastUpdated: new Date() },
        evmStatus: {
          health: meta.evm.status,
          batteryLevel: meta.evm.battery,
          lastChecked: new Date()
        },
        presenceVerification: tele.visitStatus === 'Visited' ? {
          soVisitTime: new Date(),
          soGpsLat: 28.6139,
          soGpsLng: 77.2090,
          soVisitNote: `Visited at ${tele.visitTime}`
        } : {}
      });

      boothDocs.push({ booth, meta, tele, ed });
      electionDocs.push(ed);
    }

    // ── Incidents ─────────────────────────────────────────────────────────────
    console.log('Seeding Incidents...');
    const booth104 = boothDocs.find(b => b.meta.num === 104);
    const booth103 = boothDocs.find(b => b.meta.num === 103);
    const booth108 = boothDocs.find(b => b.meta.num === 108);

    const inc1 = await Incident.create({
      incidentCode: 'INC-901',
      boothId: booth104.booth._id,
      acId: acNewDelhi._id,
      districtId: districtNewDelhi,
      reportedBy: so._id,
      reportedByRole: 'SO',
      type: 'EVM Fault',
      severity: 'Critical',
      description: 'Control Unit display frozen. Verification halted.',
      status: 'Open',
      timeline: [{ action: 'Reported', actorRole: 'SO', note: 'EVM display frozen at Booth 104', timestamp: new Date() }]
    });
    const inc2 = await Incident.create({
      incidentCode: 'INC-902',
      boothId: booth103.booth._id,
      acId: acNewDelhi._id,
      districtId: districtNewDelhi,
      reportedBy: so._id,
      reportedByRole: 'SO',
      type: 'Long Queue',
      severity: 'High',
      description: '130+ voters waiting. Expected wait time >45m.',
      status: 'Open',
      timeline: [{ action: 'Reported', actorRole: 'SO', note: 'Long queue at Booth 103', timestamp: new Date() }]
    });
    const inc3 = await Incident.create({
      incidentCode: 'INC-903',
      boothId: booth108.booth._id,
      acId: acNewDelhi._id,
      districtId: districtNewDelhi,
      reportedBy: so._id,
      reportedByRole: 'SO',
      type: 'Staff Missing',
      severity: 'Medium',
      description: 'Polling Officer 2 absent due to medical emergency.',
      status: 'Open',
      timeline: [{ action: 'Reported', actorRole: 'SO', note: 'Staff absent at Booth 108', timestamp: new Date() }]
    });

    // Link incidents to ElectionDay records
    await ElectionDay.findByIdAndUpdate(booth104.ed._id, { $push: { incidents: inc1._id } });
    await ElectionDay.findByIdAndUpdate(booth103.ed._id, { $push: { incidents: inc2._id } });
    await ElectionDay.findByIdAndUpdate(booth108.ed._id, { $push: { incidents: inc3._id } });

    console.log('\n✅ Database Seeding Completed Successfully!');
    console.log(`   Districts : ${districtDocs.length}`);
    console.log(`   ACs       : ${acDocs.length}`);
    console.log(`   Booths    : ${boothDocs.length}`);
    console.log(`   ElectionDay records: ${electionDocs.length}`);
    console.log(`   Incidents : 3`);
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();
