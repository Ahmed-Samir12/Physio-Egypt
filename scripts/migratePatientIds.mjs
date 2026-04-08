import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// ── Load env ──────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.DATABASE_URL.replace(
  '<db_password>',
  process.env.DATABASE_PASSWORD,
);

await mongoose.connect(MONGO_URI);
console.log('Connected to MongoDB');

const Patient = mongoose.connection.collection('patients');

// Find all patients with old format PT-XXXXX
const patients = await Patient.find({
  patientId: { $regex: /^PT-\d+$/ },
}).toArray();

console.log(`Found ${patients.length} patients to migrate`);

if (patients.length === 0) {
  console.log('Nothing to migrate.');
  await mongoose.disconnect();
  process.exit(0);
}

let success = 0;
let failed = 0;

for (const p of patients) {
  const oldId = p.patientId; // e.g. PT-00001
  const newId = oldId.replace('PT-', 'PT'); // → PT00001

  try {
    await Patient.updateOne({ _id: p._id }, { $set: { patientId: newId } });
    console.log(`  ✅ ${oldId} → ${newId}`);
    success++;
  } catch (err) {
    console.error(`  ❌ Failed to update ${oldId}:`, err.message);
    failed++;
  }
}

console.log(`\nDone. ${success} updated, ${failed} failed.`);
await mongoose.disconnect();
