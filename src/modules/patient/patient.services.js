import Patient from './patientModel.js';
import Booking from '../booking/booking.model.js';
import AppError from '../../utils/AppError.js';
import { escapeRegex } from '../../utils/utils-functions.js';

/**
 * Core logic: find existing patient by phone or create a new one.
 * Returns { patient, isNew }.
 */
export const findOrCreateByPhone = async (
  patientData,
  createdBy,
  forceNew = false,
) => {
  const {
    phone,
    name,
    age,
    address,
    nationality,
    notes,
    gender,
    complaint,
    whatsappNumber,
  } = patientData;

  let patient = null;
  let isNew = false;

  // forceNew = true means: skip lookup, always create a brand new patient
  // Used when a phone number belongs to a family member (e.g. father's number for a child)
  if (!forceNew) {
    patient = await Patient.findOne({ phone });
  }

  if (!patient) {
    if (!name) throw new AppError('اسم المريض مطلوب.', 400);
    patient = await Patient.create({
      phone,
      name,
      age,
      address,
      nationality,
      notes,
      createdBy,
      gender,
      complaint: complaint || '',
      whatsappNumber: whatsappNumber || '',
    });
    isNew = true;
  } else {
    const updates = {};
    if (complaint !== undefined) updates.complaint = complaint;
    if (whatsappNumber !== undefined) updates.whatsappNumber = whatsappNumber;
    if (Object.keys(updates).length) {
      Object.assign(patient, updates);
      await patient.save({ validateBeforeSave: false });
    }
  }

  return { patient, isNew };
};

/**
 * List patients who have at least one confirmed booking.
 */
export const getAllPatients = async (query) => {
  const { search, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  // Only show patients with at least one confirmed booking
  const confirmedPatientIds = await Booking.distinct('patient', {
    status: { $in: ['confirmed', 'done'] },
  }).lean();

  const filter = { _id: { $in: confirmedPatientIds } };

  if (search) {
    filter.$or = [
      { name: { $regex: escapeRegex(search), $options: 'i' } },
      { phone: { $regex: escapeRegex(search), $options: 'i' } },
      { nationality: { $regex: escapeRegex(search), $options: 'i' } },
      { patientId: { $regex: escapeRegex(search), $options: 'i' } },
    ];
  }

  const [patients, total] = await Promise.all([
    Patient.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('createdBy', 'name email'),
    Patient.countDocuments(filter),
  ]);

  return { patients, total, page: Number(page), limit: Number(limit) };
};

/**
 * Get a single patient by ID, with their booking history.
 */
export const getPatientById = async (id) => {
  const patient = await Patient.findById(id);
  if (!patient) throw new AppError('لم يتم العثور على المريض.', 404);
  return patient;
};

/**
 * Update patient info.
 */
export const updatePatient = async (id, data) => {
  // phone IS allowed to be updated — remove the old restriction
  const patient = await Patient.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });
  if (!patient) throw new AppError('لم يتم العثور على المريض.', 404);
  return patient;
};

/**
 * Hard-delete a patient record.
 */
export const deletePatient = async (id) => {
  const patient = await Patient.findByIdAndDelete(id);
  if (!patient) throw new AppError('لم يتم العثور على المريض.', 404);
  return patient;
};
