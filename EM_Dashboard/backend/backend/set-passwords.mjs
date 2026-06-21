/**
 * set-passwords.mjs
 * Sets a hashed password for all officers in MongoDB.
 * Default password for each officer = their employeeId (e.g., "ECI-001", "CEO-DL-01")
 * Run: node set-passwords.mjs
 */
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

await mongoose.connect('mongodb://127.0.0.1:27017/nagarvaani_delhi');

const User = mongoose.model('User', new mongoose.Schema({
  employeeId: String,
  role: String,
  name: String,
  passwordHash: String,
}, { strict: false }), 'users');

const users = await User.find({}).lean();

console.log(`\nSetting passwords for ${users.length} officers...\n`);

for (const u of users) {
  // Password = employeeId by default (e.g., "ECI-001", "PRO-B101")
  const plainPassword = u.employeeId;
  const hash = await bcrypt.hash(plainPassword, 10);
  await User.updateOne({ _id: u._id }, { $set: { passwordHash: hash } });
  console.log(`✅ Set password for ${String(u.role).padEnd(5)} | ${u.employeeId} → password: "${plainPassword}"`);
}

console.log('\n✅ All officer passwords set successfully!');
console.log('   Each officer logs in with:');
console.log('   • Employee ID = their employeeId (e.g., ECI-001)');
console.log('   • Password    = same as their employeeId (e.g., ECI-001)\n');

await mongoose.disconnect();
