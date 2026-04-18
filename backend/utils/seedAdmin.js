/**
 * Admin Seeder
 * Seeds initial data - run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const College = require('../models/College');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Seed sample colleges
  const colleges = [
    { name: 'ABC Engineering College', location: 'Chennai', email: 'info@abc.edu', phone: '9876543210' },
    { name: 'XYZ Arts College', location: 'Coimbatore', email: 'info@xyz.edu', phone: '9876543211' },
    { name: 'PQR Science College', location: 'Madurai', email: 'info@pqr.edu', phone: '9876543212' }
  ];

  for (const college of colleges) {
    await College.findOneAndUpdate({ name: college.name }, college, { upsert: true });
  }

  console.log('Sample colleges seeded');
  console.log(`Admin credentials: ${process.env.ADMIN_EMAIL} / ${process.env.ADMIN_PASSWORD}`);
  console.log('Note: Admin is stored in .env - no DB entry needed');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
