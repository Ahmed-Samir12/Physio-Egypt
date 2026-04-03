import express from 'express';
import * as adminController from './admin.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All admin routes require authentication + admin role
router.use(protect);

router.get('/dashboard', restrictTo('admin'), adminController.getDashboard);

router.use(restrictTo('mini-admin', 'admin'));

router.get('/users', adminController.getAllUsers);
router.patch('/users/:id/deactivate', adminController.deactivateUser);
router.patch('/users/:id/reactivate', adminController.reactivateUser);
router.get('/employees/:id', adminController.getEmployeeDetail);

export default router;
