import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError.js';
import User from '../modules/auth/user.model.js';

export const protect = async (req, res, next) => {
  // 1) get token & check it
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    throw new AppError(
      'You are not logged in, Please log in to get access',
      401,
    );

  // 2) verify token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(
      token,
      process.env.JWT_ACCESS_TOKEN_SECRET,
    );
  } catch {
    throw new AppError(
      'Invalid or expired access token. Please login again.',
      401,
    );
  }

  if (decoded.type !== 'access') throw new AppError('Invalid token type', 403);

  // 3) get user based on token
  const currentUser = await User.findById(decoded.id).select('+isActive');
  if (!currentUser)
    throw new AppError(
      'The user belonging to this token does no longer exists.',
      401,
    );

  // 4) Check account is active
  if (!currentUser.isActive) {
    throw new AppError('This account has been deactivated.', 401);
  }

  // 5) check if user changed password
  if (currentUser.changedPasswordAfter(decoded.iat))
    throw new AppError(
      'Password was recently changed, Please login again',
      401,
    );

  // 6) grant access
  req.user = currentUser;
  next();
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      throw new AppError(
        `You don't have permission to perform this action`,
        403,
      );

    next();
  };
};
