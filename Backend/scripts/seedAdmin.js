import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

const email = process.env.SEED_ADMIN_EMAIL;
const password = process.env.SEED_ADMIN_PASSWORD;
const name = process.env.SEED_ADMIN_NAME || 'Admin';

async function run() {
  if (!email || !password) {
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env');
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is required');
    process.exit(1);
  }
  await mongoose.connect(uri);
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log('Existing user promoted to admin:', email);
    } else {
      console.log('Admin already exists:', email);
    }
    await mongoose.disconnect();
    return;
  }
  await User.create({
    name,
    email,
    password,
    role: 'admin',
  });
  console.log('Admin user created:', email);
  await mongoose.disconnect();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
