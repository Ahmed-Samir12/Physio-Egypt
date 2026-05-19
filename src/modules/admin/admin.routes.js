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
router.patch(
  '/users/:id/approve',
  restrictTo('admin'),
  adminController.approveUser,
);
router.delete(
  '/users/:id/reject',
  restrictTo('admin'),
  adminController.rejectUser,
);
router.delete('/users/:id', restrictTo('admin'), adminController.deleteUser);
router.get('/employees/:id', adminController.getEmployeeDetail);

router.patch(
  '/users/:id/role',
  restrictTo('admin'),
  adminController.changeUserRole,
);

router.get('/performance', adminController.getEmployeePerformance);

export default router;
