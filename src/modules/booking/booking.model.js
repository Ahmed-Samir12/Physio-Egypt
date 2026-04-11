import mongoose from 'mongoose';
import AppError from '../../utils/AppError.js';

const { Schema } = mongoose;

const bookingSchema = new Schema(
  {
    patient: {
      type: Schema.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
    },

    bookedBy: {
      type: Schema.ObjectId,
      ref: 'User',
      required: [true, 'Booking must be linked to an employee'],
    },

    appointmentDate: {
      type: Date,
    },

    appointmentTime: {
      type: String,
      match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'],
    },

    serviceType: {
      type: String,
      trim: true,
    },

    totalPrice: {
      type: Number,
      min: [0, 'Price cannot be negative'],
    },

    deposit: {
      type: Number,
      min: [0, 'Deposit cannot be negative'],
      default: 0,
    },

    remaining: {
      type: Number,
      min: [0, 'Remaining cannot be negative'],
    },

    // Optional companion name (friend/relative attending with the patient)
    companion: {
      type: String,
      trim: true,
      default: '',
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'done', 'cancelled', 'retrieval'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['unpaid', 'partial', 'paid'],
      default: 'unpaid',
    },

    notes: {
      type: String,
      trim: true,
    },

    autoDeleteAt: {
      type: Date,
      default: () => new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000),
    },
  },
  { timestamps: true },
);

// ─── Indexes ──────────────────────────────────────────────────
bookingSchema.index({ autoDeleteAt: 1 }, { expireAfterSeconds: 0 });

bookingSchema.index({ bookedBy: 1, createdAt: -1 });
bookingSchema.index({ appointmentDate: -1 });

// ─── Auto-calculate remaining & paymentStatus before save ─────
bookingSchema.pre('save', function () {
  if (this.isModified('totalPrice') || this.isModified('deposit')) {
    if (this.deposit > this.totalPrice) {
      throw new AppError('Deposit cannot exceed total price', 400);
    }

    this.remaining = this.totalPrice - this.deposit;

    if (this.deposit === 0) this.paymentStatus = 'unpaid';
    else if (this.deposit < this.totalPrice) this.paymentStatus = 'partial';
    else this.paymentStatus = 'paid';
  }
});

// ─── Set autoDeleteAt based on appointmentDate ────────────────
bookingSchema.pre('save', function () {
  if (this.isModified('status') || this.isNew) {
    const base = this.appointmentDate || new Date();
    this.autoDeleteAt = new Date(base.getTime() + 6 * 30 * 24 * 60 * 60 * 1000);
  }
});

export default mongoose.model('Booking', bookingSchema);
