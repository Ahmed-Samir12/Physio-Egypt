import crypto from 'crypto';
import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minLength: [8, 'Password should be at least 8 characters'],
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        validator: function (el) {
          return this.password === el;
        },
        message: 'Please enter the same password',
      },
    },
    role: {
      type: String,
      enum: {
        values: ['employee', 'mini-admin', 'admin'],
      },
      default: 'employee',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,

    // email verification
    passwordResetExpires: Date,
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    photo: {
      type: String,
      default: '',
    },
  },
  { timestamps: true },
);

// Middlewares
// ─── Hash password before save ───────────────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

// ─── Record password change timestamp ───────────────────
userSchema.pre('save', function () {
  if (!this.isModified('password') || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// ─── Instance method: compare passwords ─────────────────
userSchema.methods.correctPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance method: check if password changed after JWT was issued ─
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// helper function
const TOKEN_TYPES = {
  PASSWORD_RESET: {
    tokenField: 'passwordResetToken',
    expiresField: 'passwordResetExpires',
    expiryTime: 10 * 60 * 1000, // 10 minutes
  },
  EMAIL_VERIFICATION: {
    tokenField: 'emailVerificationToken',
    expiresField: 'emailVerificationExpires',
    expiryTime: 1 * 60 * 60 * 1000, // 1 hour
  },
};

// ─── Instance method: helper function for creating tokens ───────
userSchema.methods._createSecureToken = function (config) {
  const token = crypto.randomBytes(32).toString('hex');

  this[config.tokenField] = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this[config.expiresField] = Date.now() + config.expiryTime;

  return token;
};

// ─── Instance method: create password reset token ───────
userSchema.methods.createPasswordResetToken = function () {
  return this._createSecureToken(TOKEN_TYPES.PASSWORD_RESET);
};

// ─── Instance method: create email verification token ───────
userSchema.methods.createEmailVerificationToken = function () {
  return this._createSecureToken(TOKEN_TYPES.EMAIL_VERIFICATION);
};

export default mongoose.model('User', userSchema);
