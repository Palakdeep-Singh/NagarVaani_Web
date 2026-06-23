import mongoose from 'mongoose';

await mongoose.connect('mongodb://127.0.0.1:27017/nagarvaani_delhi');
const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
const users = await User.find({}).lean();

console.log('\n╔══════════════════════════════════════════════════════════════════════╗');
console.log('║             ALL OFFICER LOGINS IN MONGODB                          ║');
console.log('╚══════════════════════════════════════════════════════════════════════╝');
console.log(`Total: ${users.length} officers\n`);

users.forEach(u => {
  console.log(`Role: ${String(u.role).padEnd(5)} | EmployeeID: ${String(u.employeeId).padEnd(15)} | Name: ${u.name}`);
});

console.log('\n⚠️  NOTE: passwordHash is NOT set for any officer.');
console.log('   The /api/auth/login route currently bypasses password check (dev mode).');
console.log('   Any password will work to log in.\n');

await mongoose.disconnect();
