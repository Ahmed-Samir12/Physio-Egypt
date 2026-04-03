import Patient from './patientModel.js';
import AppError from '../../utils/AppError.js';
import { escapeRegex } from '../../utils/utils-functions.js';

/**
 * Core logic: find existing patient by phone or create a new one.
 * Returns { patient, isNew }.
 */

export const findOrCreateByPhone = async (patientData, createdBy) => {
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

  let patient = await Patient.findOne({ phone });
  let isNew = false;

  if (!patient) {
    // Validate required fields for a new patient
    if (!name) {
      throw new AppError('Name is required for a new patient.', 400);
    }
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
    // Update mutable fields on existing patient (complaint can change per booking)
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
 * List all patients (admin + employee).
 */

export const getAllPatients = async (query) => {
  const { search, page = 1, limit = 10 } = query;
  const skip = (page - 1) * limit;

  const filter = {};
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
  if (!patient) throw new AppError('No patient found with that ID.', 404);
  return patient;
};

/**
 * Update patient info.
 */

export const updatePatient = async (id, data) => {
  // Phone changes go through findOrCreate, not direct update
  const { phone, ...safeData } = data;

  const patient = await Patient.findByIdAndUpdate(id, safeData, {
    new: true,
    runValidators: true,
  });

  if (!patient) throw new AppError('No patient found with that ID.', 404);

  return patient;
};
