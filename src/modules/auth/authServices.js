import crypto from 'crypto';
import AppError from '../../utils/AppError.js';
import User from './user.model.js';
import RefreshToken from '../token/refreshTokenModel.js';
import { EmailServices } from '../../utils/emails.js';
import * as tokenServices from '../token/tokenServices.js';
import logger from '../../utils/logger.js';

const buildUrl = (path) => {
  const base = (process.env.FRONTEND_URL || '').replace(/\/+$/, '');
  return `${base}${path}`;
};

/**
 * Signup a new user
 * @param {object} userData
 * @returns {Promise<User>}
 */

export const signupUser = async (userData) => {
  // create user
  const newUser = await User.create({
    name: userData.name,
    email: userData.email,
    password: userData.password,
    passwordConfirm: userData.passwordConfirm,
    isEmailVerified: false,
  });

  // generate email verification token
  const verificationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // send email verification
  try {
    const verificationURL = buildUrl(
      `/api/v1/auth/verify-email/${verificationToken}`,
    );
    await new EmailServices(newUser, verificationURL).sendEmailVerification();

    return {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      isEmailVerified: newUser.isEmailVerified,
    };
  } catch (err) {
    console.error('Email verification failed: ', err);
    newUser.emailVerificationToken = undefined;
    newUser.emailVerificationExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the email! Please try again later!',
      500,
    );
  }
};

/**
 * Verify email
 * @param {object} userData
 * @returns {Promise<User>}
 */

export const verifyEmail = async (token) => {
  // find user based on token & check it
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  }).select('+emailVerificationToken +emailVerificationExpires');

  if (!user) throw new AppError('Token is invalid or has expired!', 400);

  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }

  // mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  try {
    const url = buildUrl(`/dashboard`);
    await new EmailServices(user, url).sendWelcomeEmail();
  } catch (err) {
    console.error('Welcome email failed: ', err);
  }
};

export const resendVerification = async (userData) => {
  const { email } = userData;
  if (!email) throw new AppError('Please provide your email address.', 400);

  const user = await User.findOne({ email }).select(
    '+emailVerificationToken +emailVerificationExpires',
  );

  if (!user || user.isEmailVerified)
    return {
      message:
        'If that email is registered and unverified, a new link has been sent.',
    };

  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  try {
    const verificationURL = buildUrl(
      `/api/v1/auth/verify-email/${verificationToken}`,
    );
    await new EmailServices(user, verificationURL).sendEmailVerification();
  } catch (err) {
    console.error('Resend verification failed:', err.message);
  }

  return {
    message:
      'If that email is registered and unverified, a new link has been sent.',
  };
};

/**
 * Login User
 * @param {object} userData
 * @returns {Promise<User>}
 */

export const loginUser = async (userData) => {
  // 1) get email and password and check it
  const { email, password } = userData;
  if (!email || !password) {
    throw new AppError('Please provide email & password', 400);
  }

  // 2) get the user and check if exist
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password))) {
    logger.warn('Failed login attempt', { email });

    throw new AppError('Invalid email or password', 400);
  }

  if (!user.isActive)
    throw new AppError(
      'Your account has been deactivated. Contact your administrator.',
      401,
    );

  if (!user.isEmailVerified)
    throw new AppError('Please verify your email address to login.', 401);

  if (!user.isApproved)
    throw new AppError(
      'حسابك قيد المراجعة. يرجى الانتظار حتى يقوم المسؤول بتفعيل حسابك.',
      401,
    );

  logger.info('User logged in', {
    userId: user._id,
    email: user.email,
    role: user.role,
  });

  return user;
};

/**
 * rotate token and get new one
 * @param  refreshToken
 * @returns { Promise<user, token> }
 */

export const refresh = async (refreshToken) => {
  // 1) get token from cookies & check it
  if (!refreshToken) {
    throw new AppError('Refresh token required!', 401);
  }

  // 2) find the token in DB and check it
  const tokenHash = tokenServices.hashToken(refreshToken);

  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken) {
    // Token hash unknown entirely — bad/forged token
    throw new AppError('Invalid refresh token!', 403);
  }

  // Token reuse detection: token was already rotated/revoked — possible theft.
  // Revoke every token in this family to force all sessions to re-authenticate.
  if (storedToken.revoked) {
    const rotatedRecently =
      storedToken.updatedAt &&
      Date.now() - storedToken.updatedAt.getTime() < 10_000;

    if (!rotatedRecently) {
      // Genuinely suspicious — revoke the whole family
      await tokenServices.revokeTokenFamily(storedToken.familyId);
    }

    logger.warn('Token reuse detected — family revoked', {
      familyId: storedToken.familyId,
      userId: storedToken.user,
    });

    throw new AppError('Token reuse detected! Login required.', 403);
  }

  // Token is valid but expired
  if (storedToken.expiresAt.getTime() < Date.now()) {
    await tokenServices.revokeTokenFamily(storedToken.familyId);
    throw new AppError('Refresh token expired. Login required.', 401);
  }

  // 3) find user based on token & check it
  const user = await User.findById(storedToken.user);
  if (!user) {
    throw new AppError('User not found', 401);
  }

  // 4) check if user changed password
  // divide by 1000 because createdAt is date object with trillion milliseconds
  if (user.changedPasswordAfter(storedToken.createdAt.getTime() / 1000)) {
    await tokenServices.revokeTokenUser(user._id);
    throw new AppError('User changed password!, Login again', 401);
  }

  return {
    user,
    storedToken,
  };
};

/**
 * Log user out
 * @param  refreshToken
 */

export const logoutUser = async (refreshToken) => {
  if (!refreshToken) return;

  // get token & check it
  const storedToken = await RefreshToken.findOne({
    tokenHash: tokenServices.hashToken(refreshToken),
  });

  if (!storedToken) return;

  // reuse token, delete it
  if (storedToken.expiresAt.getTime() < Date.now() || storedToken.revoked) {
    await tokenServices.revokeTokenFamily(storedToken.familyId);
    return;
  }

  // delete token
  storedToken.revoked = true;
  await storedToken.save();
};

export const logoutUserFromAllDevices = async (userId) => {
  // delete all users token
  await RefreshToken.updateMany(
    { user: userId, revoked: false },
    { revoked: true },
  );
};

/**
 * Send password reset token to user email
 * @param { object } userData
 */

export const forgotUserPassword = async (userData) => {
  const { email } = userData.body;

  if (!email) throw new AppError('Please provide your email address.', 400);
  // find user based on POSTed email and check it
  const user = await User.findOne({ email: userData.body.email });
  if (!user) return;

  // generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  try {
    // send email
    const url = buildUrl(`/reset-password/${resetToken}`);

    await new EmailServices(user, url).sendPasswordRest();
  } catch (err) {
    // reset token & it's expired
    console.log(err.message);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    throw new AppError(
      'There was an error sending the email! Please try again later!',
      500,
    );
  }
};

/**
 * reset user password
 * @param { object } userData
 */

export const resetUserPassword = async (userData) => {
  // find user based on token & check it
  const hashedToken = crypto
    .createHash('sha256')
    .update(userData.params.resetToken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) throw new AppError('Token is invalid or has expired!', 400);

  if (!userData.body.newPassword || !userData.body.passwordConfirm) {
    throw new AppError('Please provide password and passwordConfirm', 400);
  }

  // set new password
  user.password = userData.body.newPassword;
  user.passwordConfirm = userData.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await tokenServices.revokeTokenUser(user._id);

  // update passwordChangedAt property

  const url = '';

  await new EmailServices(user, url)
    .sendPasswordResetSuccess()
    .catch((err) =>
      console.error('Password reset success email failed:', err.message),
    );

  return { user };
};

export const updateUserPassword = async (userData) => {
  const { currentPassword, newPassword } = userData.body;

  if (!currentPassword || !newPassword)
    throw new AppError('Please provide current and new password.', 400);

  const user = await User.findById(userData.user._id).select('+password');
  if (!(await user.correctPassword(currentPassword)))
    throw new AppError('Current password is incorrect.', 401);

  user.password = newPassword;
  user.passwordConfirm = userData.body.passwordConfirm;
  await user.save();

  await tokenServices.revokeTokenUser(user._id);

  return user;
};

export const deleteMe = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true },
  );

  if (!user) throw new Error('No user found with that ID.');
  return user;
};
