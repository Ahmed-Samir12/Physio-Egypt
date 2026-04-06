import express from 'express';
import * as authcontroller from './authController.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// public
router.post('/signup', authcontroller.signup);
router.post('/login', authcontroller.login);

// email verification
router.get('/verify-email/:token', authcontroller.verifyEmail);
router.post('/verify-email/:token', authcontroller.verifyEmail);
router.post('/resend-verification', authcontroller.resendVerification);

// refresh token
router.post('/refresh', authcontroller.refresh);
router.get('/refresh-page', authcontroller.refreshPage);
router.delete('/logout', authcontroller.logout);
router.delete('/logout-all', protect, authcontroller.logoutAll);
router.post('/forgetPassword', authcontroller.forgotPassword);
router.patch('/resetPassword/:resetToken', authcontroller.resetPassword);

router.use(protect);

router.get('/me', authcontroller.getMe);
router.patch('/me', authcontroller.updateMe);

router.patch('/update-password', authcontroller.updatePassword);
router.patch('/delete-me', authcontroller.deleteMe);

export default router;
