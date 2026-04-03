import express from 'express';
import { getEmployeeDashboard } from './employee.services.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect, restrictTo('employee', 'mini-admin', 'admin'));

router.get('/dashboard', async (req, res) => {
  const data = await getEmployeeDashboard(req.user._id, req.query);
  res.status(200).json({ status: 'success', data });
});

export default router;
