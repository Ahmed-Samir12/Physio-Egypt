import * as tokenServices from '../token/tokenServices.js';
import * as authServices from './authServices.js';
import { sendTokens, removeCookie, setCookie } from '../../utils/jwt.js';
import AppError from '../../utils/AppError.js';
import path from 'path';

// signup new user
export const signup = async (req, res) => {
  const newUser = await authServices.signupUser(req.body);

  res.status(201).json({
    status: 'success',
    message: 'Account created! Please check your email to verify your account.',
    data: {
      newUser,
    },
  });
};

export const verifyEmail = async (req, res) => {
  try {
    await authServices.verifyEmail(req.params.token);
    res.redirect('/verify-email/success');
  } catch (err) {
    // Map service error messages to a reason for the UI
    const msg = String(err?.message || '').toLowerCase();
    const reason =
      msg.includes('invalid or has expired') || msg.includes('expired')
        ? 'expired'
        : 'invalid';
    res.redirect(`/verify-email/error?reason=${encodeURIComponent(reason)}`);
  }
};

export const resendVerification = async (req, res) => {
  const { message } = await authServices.resendVerification(req.body);

  res.status(200).json({
    status: 'success',
    message,
  });
};

export const login = async (req, res) => {
  const user = await authServices.loginUser(req.body);

  // send tokens
  await sendTokens(user, 200, req, res);
};

export const refresh = async (req, res) => {
  // get refresh token and check it
  const { user, storedToken } = await authServices.refresh(
    req.cookies.refreshToken,
  );

  // generate new tokens
  const { newAccessToken, newRefreshToken, expiresAt } =
    await tokenServices.rotateRefreshToken(
      storedToken,
      user,
      req.ip,
      req.get('user-agent'),
    );

  removeCookie(res);

  setCookie(newRefreshToken, expiresAt, res);

  res.status(200).json({
    status: 'success',
    accessToken: newAccessToken,
  });
};

export const logout = async (req, res) => {
  await authServices.logoutUser(req.cookies.refreshToken);

  removeCookie(res);

  res.status(204).json({
    status: 'success',
  });
};

export const logoutAll = async (req, res) => {
  await authServices.logoutUserFromAllDevices(req.user.id);

  removeCookie(res);

  res.status(204).json({
    status: 'success',
  });
};

export const forgotPassword = async (req, res) => {
  await authServices.forgotUserPassword(req);

  res.status(200).json({
    status: 'success',
    message: 'If the email exists, a reset link was sent',
  });
};

export const resetPassword = async (req, res) => {
  const { user } = await authServices.resetUserPassword(req);

  await sendTokens(user, 200, req, res);
};

export const getMe = async (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

export const updatePassword = async (req, res) => {
  const user = await authServices.updateUserPassword(req);

  sendTokens(user, 200, req, res);
};

export const deleteMe = async (req, res) => {
  await authServices.deleteMe(req.user.id);

  res.status(200).json({
    status: 'success',
  });
};

export const updateMe = async (req, res) => {
  const { uploadMemory, processAvatar } = await import('../../utils/upload.js');
  const User = (await import('./user.model.js')).default;

  // Run multer middleware manually to populate req.file
  try {
    await new Promise((resolve, reject) => {
      uploadMemory(req, res, (err) => (err ? reject(err) : resolve()));
    });
  } catch (err) {
    throw new AppError(err?.message || 'فشل رفع الصورة.', 400);
  }

  const updates = {};

  if (req.body?.name !== undefined) {
    const nextName = String(req.body.name).trim();
    if (nextName) updates.name = nextName;
  }

  if (req.file) {
    // Delete old avatar file if it exists (best-effort cleanup)
    try {
      const currentUser = await User.findById(req.user.id).select('photo');
      const oldPhoto = currentUser?.photo;
      if (
        typeof oldPhoto === 'string' &&
        oldPhoto.startsWith('/uploads/avatars/')
      ) {
        const oldRel = oldPhoto.replace(/^\/+/, '');
        const oldPath = path.join(process.cwd(), 'src/public', oldRel);
        const { unlink } = await import('fs/promises');
        unlink(oldPath).catch(() => {});
      }
    } catch {
      // Non-blocking cleanup
    }

    updates.photo = await processAvatar(req.file.buffer, req.user.id);
  } else if (req.body?.photo !== undefined) {
    // Back-compat: old JSON body with base64/URL string
    updates.photo = req.body.photo;
  }

  const user = await User.findByIdAndUpdate(req.user.id, updates, {
    new: true,
    runValidators: false,
  });

  res.status(200).json({ status: 'success', data: { user } });
};
