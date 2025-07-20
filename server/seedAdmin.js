import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Admin from './models/Admin.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

const seedAdmin = async () => {
  await connectDB();

  const existing = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
  if (existing) {
    console.log('⚠️ Admin already exists. Skipping seed.');
    return process.exit();
  }

  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

  const admin = new Admin({
    username: process.env.ADMIN_USERNAME || 'superadmin',
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    superAdmin: true
  });

  await admin.save();

  console.log('✅ Admin created successfully!');
  console.log('🔑 Credentials:');
  console.log(`   Email: ${process.env.ADMIN_EMAIL}`);
  console.log(`   Password: ${process.env.ADMIN_PASSWORD}`);
  process.exit();
};

seedAdmin();
