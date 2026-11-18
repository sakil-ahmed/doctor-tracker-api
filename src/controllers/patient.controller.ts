import type { Request, Response } from 'express';
import {
  createDoctorPatient,
  deleteDoctorPatient,
  deletePatient,
  getPatientById,
  listDoctorPatients,
  listPatients,
  updatePatient,
} from '../services/patient.service';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createPatientSchema,
  doctorPatientIdParamsSchema,
  doctorPatientParamsSchema,
  doctorPatientsQuerySchema,
  patientIdSchema,
  patientQuerySchema,
  updatePatientSchema,
} from '../validators/patient.validator';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = patientQuerySchema.parse(req.query);
  const result = await listPatients(query);

  res.status(200).json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = patientIdSchema.parse(req.params);
  const patient = await getPatientById(id);

  res.status(200).json({
    data: patient,
  });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = patientIdSchema.parse(req.params);
  const input = updatePatientSchema.parse(req.body);
  const patient = await updatePatient(id, input);

  res.status(200).json({
    data: patient,
  });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = patientIdSchema.parse(req.params);
  await deletePatient(id);

  res.status(200).json({
    success: true,
    message: 'Patient deleted successfully',
  });
});

export const listByDoctor = asyncHandler(async (req: Request, res: Response) => {
  const { id } = doctorPatientParamsSchema.parse(req.params);
  const query = doctorPatientsQuerySchema.parse(req.query);
  const result = await listDoctorPatients(id, query);

  res.status(200).json(result);
});

export const createForDoctor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = doctorPatientParamsSchema.parse(req.params);
    const input = createPatientSchema.parse(req.body);
    const patient = await createDoctorPatient(id, input);

    res.status(201).json({
      data: patient,
    });
  }
);

export const removeFromDoctor = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, patientId } = doctorPatientIdParamsSchema.parse(req.params);
    await deleteDoctorPatient(id, patientId);

    res.status(200).json({
      success: true,
      message: 'Patient deleted successfully',
    });
  }
);
