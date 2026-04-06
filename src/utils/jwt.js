import JWT from 'jsonwebtoken';
import { createToken } from '../modules/token/tokenServices.js';

// create access token
export const signAccessToken = (user) => {
  return JWT.sign(
    { id: user._id, role: user.role, type: 'access' },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN,
    },
  );
};

export const setCookie = (accessToken, refreshToken, expiresAt, res) => {
  // Access token — short-lived, sent everywhere
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
    path: '/',
  });

  // Refresh token — long-lived, locked to auth endpoints only
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: expiresAt,
    path: '/api/v1/auth',
  });
};

export const removeCookie = (res) => {
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
};

export const sendTokens = async (user, statusCode, req, res) => {
  const { accessToken, refreshToken, expiresAt } = await createToken(
    user,
    req.ip,
    req.get('user-agent'),
  );

  setCookie(accessToken, refreshToken, expiresAt, res);

  // remove password from responce
  user.password = undefined;
  user.isActive = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: {
      user,
    },
  });
};
