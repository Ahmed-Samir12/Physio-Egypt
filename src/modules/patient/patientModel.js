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
      validate: {
        validator: function (value) {
          if (!value) return true;
          const phone = parsePhoneNumberFromString(value, 'EG');
          return phone && phone.isValid();
        },
        message: 'Invalid WhatsApp number',
      },
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

patientSchema.pre('validate', function () {
  const norm = (v) => {
    if (!v || typeof v !== 'string') return v;
    let p = v.trim();
    if (p.startsWith('+20')) p = p.slice(3);
    else if (p.startsWith('+2')) p = p.slice(2);
    else if (p.startsWith('200')) p = p.slice(3);
    else if (p.startsWith('20')) p = p.slice(2);
    if (p && !p.startsWith('0')) p = '0' + p;
    return p;
  };
  if (this.phone) this.phone = norm(this.phone);
  if (this.whatsappNumber) this.whatsappNumber = norm(this.whatsappNumber);
});

// Auto-generate patientId before first save
patientSchema.pre('save', async function () {
  if (this.patientId) return;

  // Atomic: find the highest existing patientId and increment
  const last = await mongoose
    .model('Patient')
    .findOne({ patientId: { $exists: true, $ne: null } })
    .sort({ createdAt: -1 })
    .select('patientId')
    .lean();

  let next = 1;
  if (last?.patientId) {
    const num = parseInt(last.patientId.replace('PT', ''), 10);
    if (!isNaN(num)) next = num + 1;
  }

  // Use findOneAndUpdate to claim this ID atomically
  const candidate = `PT${String(next).padStart(5, '0')}`;
  const existing = await mongoose
    .model('Patient')
    .findOne({ patientId: candidate })
    .lean();

  if (existing) {
    // Another request got there first — increment again
    this.patientId = `PT${String(next + 1).padStart(5, '0')}`;
  } else {
    this.patientId = candidate;
  }
});

export default mongoose.model('Patient', patientSchema);
