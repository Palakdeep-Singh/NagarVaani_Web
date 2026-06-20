import type { Booth, BoothIncident, DistrictName } from '../types';

const DISTRICTS: DistrictName[] = [
  'New Delhi', 'North Delhi', 'North West Delhi', 'West Delhi',
  'South West Delhi', 'South Delhi', 'South East Delhi', 'Central Delhi',
  'East Delhi', 'Shahdara', 'North East Delhi'
];

const OFFICER_FIRST = ['Rajesh', 'Priya', 'Anil', 'Sunita', 'Vikram', 'Meera', 'Sanjay', 'Kavita', 'Arun', 'Neha'];
const OFFICER_LAST = ['Kumar', 'Singh', 'Sharma', 'Gupta', 'Verma', 'Yadav', 'Mehta', 'Joshi', 'Nair', 'Reddy'];

const INCIDENT_TYPES: BoothIncident['type'][] = [
  'EVM Issue', 'Queue Surge', 'Crowd/Law & Order', 'Staff Shortage', 'Voter Complaint', 'Other'
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}

function generateIncidents(status: Booth['status']): BoothIncident[] {
  if (status === 'Normal') return [];
  const count = status === 'Critical' ? rand(2, 3) : rand(1, 2);
  return Array.from({ length: count }, (_, i) => ({
    id: `inc-${Math.random().toString(36).slice(2, 8)}`,
    time: `${rand(7, 17)}:${rand(0, 5)}${rand(0, 9)}`,
    type: pick(INCIDENT_TYPES),
    description: pick([
      'EVM malfunction reported, backup unit requested.',
      'Queue exceeding 200 voters, requesting crowd management support.',
      'Minor altercation between party workers outside booth perimeter.',
      'Presiding officer reports one polling staff absent.',
      'Voter alleges name missing from electoral roll.',
      'Generator failure causing intermittent power loss at booth.',
    ]),
    status: i === 0 && status === 'Critical' ? 'Critical' : pick(['Watch', 'Resolved']),
  }));
}

export function generateBooths(count = 44): Booth[] {
  const booths: Booth[] = [];
  for (let i = 0; i < count; i++) {
    const district = pick(DISTRICTS);
    const registeredVoters = rand(800, 1600);
    const turnoutPct = rand(28, 78);
    const votesCast = Math.round((turnoutPct / 100) * registeredVoters);
    const statusRoll = Math.random();
    const status: Booth['status'] =
      statusRoll > 0.92 ? 'Critical' : statusRoll > 0.78 ? 'Watch' : statusRoll > 0.74 ? 'Resolved' : 'Normal';

    booths.push({
      id: `booth-${i + 1}`,
      boothNumber: `${rand(1, 250)}${pick(['A', 'B', 'C'])}`,
      name: `${pick(['Govt. Senior Secondary School', 'Municipal Primary School', 'Community Hall', 'Govt. Boys School', 'Govt. Girls School'])}, ${district}`,
      district,
      ward: `Ward ${rand(1, 60)}`,
      presidingOfficer: `${pick(OFFICER_FIRST)} ${pick(OFFICER_LAST)}`,
      registeredVoters,
      votesCast,
      turnoutPct,
      status,
      queueLengthMins: status === 'Critical' ? rand(45, 90) : status === 'Watch' ? rand(20, 45) : rand(2, 20),
      lastUpdated: `${rand(7, 17)}:${rand(0, 5)}${rand(0, 9)} ${rand(0,1) ? 'AM' : 'PM'}`,
      incidents: generateIncidents(status),
    });
  }
  return booths;
}
