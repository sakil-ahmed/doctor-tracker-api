import { Doctor } from '../models';
import { AppError } from '../utils/AppError';
import {
  buildCreatedAtFilter,
  paginationMeta,
  paginationSkip,
  parseSort,
} from '../utils/query';
import type {
  CreateDoctorInput,
  DoctorQueryInput,
} from '../validators/doctor.validator';

type DoctorFilter = {
  $text?: { $search: string };
  specialization?: string;
  hospital?: string;
  createdAt?: {
    $gte?: Date;
    $lte?: Date;
  };
};

const ALLOWED_SORT_FIELDS = new Set([
  'name',
  'specialization',
  'hospital',
  'email',
  'createdAt',
]);

const DOCTOR_LIST_PROJECTION = {
  name: 1,
  email: 1,
  phone: 1,
  specialization: 1,
  hospital: 1,
  createdAt: 1,
} as const;

export const createDoctor = async (input: CreateDoctorInput) => {
  try {
    const doctor = await Doctor.create(input);
    return doctor.toObject();
  } catch (error: unknown) {
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    ) {
      throw new AppError('Doctor with this email already exists', 409);
    }
    throw error;
  }
};

export const getDoctorById = async (id: string) => {
  const doctor = await Doctor.findById(id).select(DOCTOR_LIST_PROJECTION).lean();

  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  return doctor;
};

export const listDoctors = async (query: DoctorQueryInput) => {
  const { page, limit, search, specialization, hospital, from, to, sort } =
    query;

  const filter: DoctorFilter = {};

  if (search) {
    filter.$text = { $search: search };
  }

  if (specialization) {
    filter.specialization = specialization;
  }

  if (hospital) {
    filter.hospital = hospital;
  }

  const createdAt = buildCreatedAtFilter(from, to);
  if (createdAt) {
    filter.createdAt = createdAt;
  }

  const skip = paginationSkip(page, limit);
  const sortOption = parseSort(sort, ALLOWED_SORT_FIELDS);

  const projection = search
    ? { ...DOCTOR_LIST_PROJECTION, score: { $meta: 'textScore' as const } }
    : DOCTOR_LIST_PROJECTION;

  const sortWithText = search
    ? { score: { $meta: 'textScore' as const }, ...sortOption }
    : sortOption;

  const [data, total] = await Promise.all([
    Doctor.find(filter)
      .select(projection)
      .sort(sortWithText)
      .skip(skip)
      .limit(limit)
      .lean(),
    Doctor.countDocuments(filter),
  ]);

  return {
    data,
    meta: paginationMeta(total, page, limit),
  };
};
