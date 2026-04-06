import express from 'express';
import * as patientController from './patient.controller.js';
import { protect, restrictTo } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.patch('/:id', patientController.updatePatient);

// Only admin / mini-admin can permanently delete a patient
router.delete(
  '/:id',
  restrictTo('admin', 'mini-admin'),
  patientController.deletePatient,
);

export default router;
