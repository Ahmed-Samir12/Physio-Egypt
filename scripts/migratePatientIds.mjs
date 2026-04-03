import mongoose from 'mongoose';
import '../src/config/env.js';
import connectDB from '../src/config/db.js';
import Patient from '../src/modules/patient/patientModel.js';

await connectDB();

const filter = {
  $or: [
    { patientId: { $exists: false } },
    { patientId: null },
    { patientId: '' },
  ],
};

let updated = 0;

// Use cursor to avoid loading everything in memory.
for await (const patient of Patient.find(filter).cursor()) {
  if (patient.patientId) continue; // just in case
  await patient.save(); // triggers pre('save') hook
  updated += 1;

  if (updated % 50 === 0) {
    console.log(`... migrated ${updated} patients`);
  }
}

console.log(`✅ PatientId migration complete. Updated: ${updated}`);

await mongoose.connection.close();

