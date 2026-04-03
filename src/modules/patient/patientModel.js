import mongoose from 'mongoose';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    patientId: {
      type: String,
      unique: true,
      index: true,
    },
    createdBy: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Patient must have a name'],
      trim: true,
    },

    phone: {
      type: String,
      required: [true, 'Patient must have a phone number'],
      trim: true,
      validate: {
        validator: function (value) {
          const phone = parsePhoneNumberFromString(value, 'EG');
          return phone && phone.isValid();
        },
        message: 'Invalid phone number',
      },
    },

    age: {
      type: Number,
      required: [true, 'Patient must have an age'],
    },

    gender: {
      type: String,
      enum: ['male', 'female'],
      required: [true, 'Patient must have a gender'],
    },

    address: {
      type: String,
      trim: true,
    },

    nationality: {
      type: String,
      trim: true,
      default: '',
    },

    complaint: {
      type: String,
      trim: true,
      default: '',
    },

    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
    },

    notes: String,
  },
  { timestamps: true },
);

patientSchema.index({ phone: 1 });

// Auto-generate patientId before first save
patientSchema.pre('save', async function () {
  if (this.patientId) return;

  const last = await mongoose.model('Patient')
    .findOne({ patientId: { $exists: true, $ne: null } })
    .sort({ patientId: -1 })
    .select('patientId')
    .lean();

  let next = 1;
  if (last?.patientId) {
    const num = parseInt(last.patientId.replace('PT-', ''), 10);
    if (!isNaN(num)) next = num + 1;
  }

  this.patientId = `PT-${String(next).padStart(5, '0')}`;
});

export default mongoose.model('Patient', patientSchema);
