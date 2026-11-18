import type { Request, Response } from 'express';
import {
  createDoctor,
  getDoctorById,
  listDoctors,
} from '../services/doctor.service';
import { asyncHandler } from '../utils/asyncHandler';
import {
  createDoctorSchema,
  doctorIdSchema,
  doctorQuerySchema,
} from '../validators/doctor.validator';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const input = createDoctorSchema.parse(req.body);
  const doctor = await createDoctor(input);

  res.status(201).json({
    data: doctor,
  });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const query = doctorQuerySchema.parse(req.query);
  const result = await listDoctors(query);

  res.status(200).json(result);
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = doctorIdSchema.parse(req.params);
  const doctor = await getDoctorById(id);

  res.status(200).json({
    data: doctor,
  });
});
