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
    },

    address: {
      type: String,
      trim: true,
      required: [true, 'Please provide an address'],
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
      required: true,
    },

    whatsappNumber: {
      type: String,
      trim: true,
      default: '',
    },

    notes: String,

    autoDeleteAt: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

patientSchema.index({ phone: 1 });

// TTL index: MongoDB auto-deletes documents at the value of autoDeleteAt
patientSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

// Helper to reset the 6-month clock (call this on each new confirmed booking)
patientSchema.methods.resetAutoDelete = async function () {
  this.autoDeleteAt = new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000);
  await this.save({ validateBeforeSave: false });
};

// Auto-generate patientId before first save
patientSchema.pre('save', async function () {
  if (this.patientId) return;

  const last = await mongoose
    .model('Patient')
    .findOne({ patientId: { $exists: true, $ne: null } })
    .sort({ patientId: -1 })
    .select('patientId')
    .lean();

  let next = 1;
  if (last?.patientId) {
    const num = parseInt(last.patientId.replace('PT', ''), 10);
    if (!isNaN(num)) next = num + 1;
  }

  this.patientId = `PT${String(next).padStart(5, '0')}`;
});

export default mongoose.model('Patient', patientSchema);
