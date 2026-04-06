import * as patientService from './patient.services.js';
import Booking from '../booking/booking.model.js';

export const getAllPatients = async (req, res) => {
  const result = await patientService.getAllPatients(req.query);
  res.status(200).json({ status: 'success', data: { ...result } });
};

export const getPatient = async (req, res) => {
  const [patient, bookings] = await Promise.all([
    patientService.getPatientById(req.params.id),
    Booking.find({ patient: req.params.id })
      .sort({ appointmentDate: -1 })
      .limit(50)
      .select(
        'serviceType appointmentDate appointmentTime status paymentStatus totalPrice deposit companion',
      )
      .lean(),
  ]);

  res.status(200).json({
    status: 'success',
    data: { patient, bookings },
  });
};

export const updatePatient = async (req, res) => {
  const patient = await patientService.updatePatient(req.params.id, req.body);
  res.status(200).json({ status: 'success', data: { patient } });
};

export const deletePatient = async (req, res) => {
  await patientService.deletePatient(req.params.id);
  res.status(204).send();
};
