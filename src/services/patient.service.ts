import { Doctor, Patient } from '../models';
import { AppError } from '../utils/AppError';
import {
  buildCreatedAtFilter,
  paginationMeta,
  paginationSkip,
  parseSort,
} from '../utils/query';
import type {
  CreatePatientInput,
  DoctorPatientsQueryInput,
  PatientQueryInput,
  UpdatePatientInput,
} from '../validators/patient.validator';

const DOCTOR_POPULATE = { path: 'doctor', select: 'name specialization' };

const PATIENT_LIST_PROJECTION = {
  name: 1,
  age: 1,
  gender: 1,
  phone: 1,
  email: 1,
  condition: 1,
  doctor: 1,
  createdAt: 1,
} as const;

type PatientFilter = {
  $text?: { $search: string };
  condition?: string;
  doctor?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
};

const ALLOWED_SORT_FIELDS = new Set([
  'name',
  'age',
  'email',
  'condition',
  'createdAt',
]);

const assertDoctorExists = async (doctorId: string): Promise<void> => {
  const doctor = await Doctor.exists({ _id: doctorId });

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }
};

export const listDoctorPatients = async (
  doctorId: string,
  query: DoctorPatientsQueryInput
) => {
  await assertDoctorExists(doctorId);

  const { page, limit } = query;
  const skip = paginationSkip(page, limit);
  const filter = { doctor: doctorId };

  // Uses compound index { doctor: 1, createdAt: -1 }
  const [data, total] = await Promise.all([
    Patient.find(filter)
      .select(PATIENT_LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return {
    data,
    meta: paginationMeta(total, page, limit),
  };
};

export const createDoctorPatient = async (
  doctorId: string,
  input: CreatePatientInput
) => {
  await assertDoctorExists(doctorId);

  const patient = await Patient.create({
    ...input,
    doctor: doctorId,
  });

  return patient.toObject();
};

export const deleteDoctorPatient = async (
  doctorId: string,
  patientId: string
): Promise<void> => {
  await assertDoctorExists(doctorId);

  const patient = await Patient.findById(patientId).select('doctor').lean();

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  if (patient.doctor.toString() !== doctorId) {
    throw new AppError('Patient does not belong to this doctor', 400);
  }

  await Patient.findByIdAndDelete(patientId);
};

export const listPatients = async (query: PatientQueryInput) => {
  const { page, limit, search, condition, doctor, from, to, sort } = query;

  const filter: PatientFilter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (condition) {
    filter.condition = condition;
  }

  if (doctor) {
    filter.doctor = doctor;
  }

  const createdAt = buildCreatedAtFilter(from, to);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  const skip = paginationSkip(page, limit);
  const sortOption = parseSort(sort, ALLOWED_SORT_FIELDS);

  const projection = search
    ? { ...PATIENT_LIST_PROJECTION, score: { $meta: 'textScore' as const } }
    : PATIENT_LIST_PROJECTION;

  const sortWithText = search
    ? { score: { $meta: 'textScore' as const }, ...sortOption }
    : sortOption;

  const [data, total] = await Promise.all([
    Patient.find(filter)
      .select(projection)
      .populate(DOCTOR_POPULATE)
      .sort(sortWithText)
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return {
    data,
    meta: paginationMeta(total, page, limit),
  };
};

export const getPatientById = async (id: string) => {
  const patient = await Patient.findById(id)
    .select(PATIENT_LIST_PROJECTION)
    .populate(DOCTOR_POPULATE)
    .lean();

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return patient;
};

export const updatePatient = async (id: string, input: UpdatePatientInput) => {
  await assertDoctorExists(input.doctor);

  const patient = await Patient.findByIdAndUpdate(id, input, {
    new: true,
    runValidators: true,
  })
    .select(PATIENT_LIST_PROJECTION)
    .populate(DOCTOR_POPULATE)
    .lean();

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }

  return patient;
};

export const deletePatient = async (id: string): Promise<void> => {
  const patient = await Patient.findByIdAndDelete(id).lean();

  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
};
