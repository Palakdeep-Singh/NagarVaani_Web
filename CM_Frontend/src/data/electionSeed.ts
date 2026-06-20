import type {
  Booth, DistrictName, EmergencyIncident, EmergencySeverity, EmergencyType,
  EVMScanEvent, EVMStatus, EVMUnit, MockPollSession, TurnoutHourPoint
} from '../types';

const DISTRICTS: DistrictName[] = [
  'New Delhi', 'North Delhi', 'North West Delhi', 'West Delhi',
  'South West Delhi', 'South Delhi', 'South East Delhi', 'Central Delhi',
  'East Delhi', 'Shahdara', 'North East Delhi'
];

const OFFICER_FIRST = ['Rajesh', 'Priya', 'Anil', 'Sunita', 'Vikram', 'Meera', 'Sanjay', 'Kavita', 'Arun', 'Neha'];
const OFFICER_LAST = ['Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Yadav', 'Mehta', 'Joshi', 'Nair', 'Reddy'];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function officerName(): string {
  return `${pick(OFFICER_FIRST)} ${pick(OFFICER_LAST)}`;
}
function qr(): string {
  return `EVM-QR-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
}

const STATUS_FLOW: EVMStatus[] = ['Warehouse', 'In Transit', 'At Booth', 'Sealed Post-Poll', 'Returned to Warehouse'];

function generateHistory(upToStatusIdx: number, district: string): EVMScanEvent[] {
  return STATUS_FLOW.slice(0, upToStatusIdx + 1).map((status, i) => ({
    id: `scan-${Math.random().toString(36).slice(2, 8)}`,
    time: `${rand(6, 18)}:${rand(0, 5)}${rand(0, 9)} ${i % 2 ? 'PM' : 'AM'}`,
    scannedBy: officerName(),
    location: status === 'Warehouse' || status === 'Returned to Warehouse' ? `${district} District Warehouse` : status === 'In Transit' ? `En route, ${district}` : `Booth Premises, ${district}`,
    gpsLat: 28.4 + Math.random() * 0.6,
    gpsLng: 76.8 + Math.random() * 0.5,
    qrCode: qr(),
    note: status,
  }));
}

export function generateEVMUnits(count = 60): EVMUnit[] {
  return Array.from({ length: count }, (_, i) => {
    const district = pick(DISTRICTS);
    const statusIdx = rand(0, STATUS_FLOW.length - 1);
    return {
      id: `evm-${i + 1}`,
      serialNumber: `DL${rand(1000, 9999)}${pick(['CU', 'BU', 'VV'])}`,
      type: pick(['Control Unit', 'Ballot Unit', 'VVPAT'] as const),
      status: STATUS_FLOW[statusIdx],
      assignedBoothNumber: `${rand(1, 250)}${pick(['A', 'B', 'C'])}`,
      district,
      custodyOfficer: officerName(),
      history: generateHistory(statusIdx, district),
    };
  });
}

const CHECKLIST_ITEMS = [
  'EVM powered on and self-test passed',
  'Mock votes cast for all candidates (minimum 50 votes)',
  'VVPAT slips matched against control unit count',
  'Mock poll certificate signed by agents',
  'EVM cleared and sealed for live polling',
];

export function generateMockPollSessions(count = 30): MockPollSession[] {
  return Array.from({ length: count }, (_, i) => {
    const district = pick(DISTRICTS);
    const status = pick(['Scheduled', 'In Progress', 'Passed', 'Failed'] as const);
    return {
      id: `mock-${i + 1}`,
      boothNumber: `${rand(1, 250)}${pick(['A', 'B', 'C'])}`,
      district,
      scheduledTime: `${rand(6, 8)}:${rand(0, 5)}${rand(0, 9)} AM`,
      status,
      conductedBy: officerName(),
      checklist: CHECKLIST_ITEMS.map((label, idx) => ({
        id: `chk-${i}-${idx}`,
        label,
        checked: status === 'Passed' ? true : status === 'Failed' ? idx < 2 : status === 'In Progress' ? idx < 3 : false,
      })),
      remarks: status === 'Failed' ? 'VVPAT mismatch detected — unit flagged for replacement.' : status === 'Passed' ? 'All checks cleared, ready for live poll.' : '',
    };
  });
}

const EMERGENCY_TYPES: EmergencyType[] = ['Long Queue', 'EVM Malfunction', 'Law & Order', 'Medical Emergency', 'Violence/Booth Capturing', 'Staff Shortage', 'Other'];
const SEVERITY: EmergencySeverity[] = ['Low', 'Medium', 'High', 'Critical'];

export function generateEmergencies(count = 22): EmergencyIncident[] {
  return Array.from({ length: count }, (_, i) => {
    const severity = pick(SEVERITY);
    return {
      id: `emg-${i + 1}`,
      boothNumber: `${rand(1, 250)}${pick(['A', 'B', 'C'])}`,
      district: pick(DISTRICTS),
      type: pick(EMERGENCY_TYPES),
      severity,
      status: pick(['Open', 'Acknowledged', 'Resolving', 'Resolved'] as const),
      reportedAt: `${rand(7, 17)}:${rand(0, 5)}${rand(0, 9)}`,
      slaMinutes: severity === 'Critical' ? 15 : severity === 'High' ? 30 : severity === 'Medium' ? 60 : 120,
      assignedTo: officerName(),
      description: pick([
        'Voter queue exceeding 200 with 90+ minute wait time.',
        'Control unit display frozen, backup unit requested.',
        'Scuffle between rival party workers near booth gate.',
        'Elderly voter collapsed in queue, medical team dispatched.',
        'Unauthorized crowd attempting to block entry, police deployed.',
        'Presiding officer reports two polling staff absent.',
      ]),
    };
  });
}

export function generateHourlyTurnout(): TurnoutHourPoint[] {
  const hours = ['7 AM', '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM'];
  let cumulative = 0;
  const totalRegistered = 14_800_000;
  return hours.map((hour, i) => {
    const increment = i < 2 ? rand(3, 6) : i < 5 ? rand(6, 9) : i < 9 ? rand(4, 7) : rand(2, 5);
    cumulative = Math.min(cumulative + increment, 78);
    return {
      hour,
      turnoutPct: cumulative,
      votesCast: Math.round((cumulative / 100) * totalRegistered),
    };
  });
}

// Booth "health" score derived from existing booth operational data —
// feeds the colour-coded regional heatmap.
export function computeBoothHealth(booth: Booth): number {
  let score = 100;
  if (booth.status === 'Critical') score -= 50;
  if (booth.status === 'Watch') score -= 25;
  score -= Math.min(booth.queueLengthMins, 60) * 0.5;
  score -= booth.incidents.filter(i => i.status !== 'Resolved').length * 8;
  return Math.max(0, Math.min(100, Math.round(score)));
}
