import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect('mongodb://127.0.0.1:27017/nagarvaani_delhi');

const User = mongoose.model('User', new mongoose.Schema({
  employeeId: String,
  role: String,
  name: String,
  passwordHash: String,
  assignedBooth: String,
  assignedAC: String,
  assignedDistrict: String,
  jurisdictionLevel: Number,
}, { strict: false }), 'users');

async function seedPO() {
  console.log('Seeding Polling Officers (PO)...');

  // We will seed 3 Polling Officers
  const pos = [
    {
      employeeId: 'PO-B101-1',
      userId: 'PO-B101-1',
      role: 'PO',
      name: 'Polling Officer 1 – Booth 101',
      assignedBooth: 'Booth 101',
      assignedAC: 'AC-40 New Delhi',
      assignedDistrict: 'New Delhi',
      jurisdictionLevel: 6,
    },
    {
      employeeId: 'PO-B101-2',
      userId: 'PO-B101-2',
      role: 'PO',
      name: 'Polling Officer 2 – Booth 101',
      assignedBooth: 'Booth 101',
      assignedAC: 'AC-40 New Delhi',
      assignedDistrict: 'New Delhi',
      jurisdictionLevel: 6,
    },
    {
      employeeId: 'PO-B102-1',
      userId: 'PO-B102-1',
      role: 'PO',
      name: 'Polling Officer 1 – Booth 102',
      assignedBooth: 'Booth 102',
      assignedAC: 'AC-40 New Delhi',
      assignedDistrict: 'New Delhi',
      jurisdictionLevel: 6,
    }
  ];

  for (const po of pos) {
    const plainPassword = po.employeeId;
    const hash = await bcrypt.hash(plainPassword, 10);
    po.passwordHash = hash;

    await User.updateOne(
      { employeeId: po.employeeId },
      { $set: po },
      { upsert: true }
    );
    console.log(`✅ Seeded PO: ${po.employeeId}`);
  }

  console.log('✅ Polling Officers seeded successfully.');
  process.exit(0);
}

seedPO().catch(err => {
  console.error(err);
  process.exit(1);
});
