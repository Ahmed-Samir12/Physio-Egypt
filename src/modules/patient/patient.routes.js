import express from 'express';
import * as patientController from './patient.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/', patientController.getAllPatients);
router.get('/:id', patientController.getPatient);
router.patch('/:id', patientController.updatePatient);

export default router;
