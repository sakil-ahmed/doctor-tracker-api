import { z } from 'zod';
import {
  emptyToUndefined,
  objectIdSchema,
  paginationQuerySchema,
} from './common.validator';

export const createPatientSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  age: z.coerce
    .number({ error: 'Age is required' })
    .int('Age must be an integer')
    .min(0, 'Age cannot be negative')
    .max(150, 'Age is too high'),
  gender: z.enum(['male', 'female', 'other'], {
    error: 'Gender must be male, female, or other',
  }),
  phone: z.string({ error: 'Phone is required' }).trim().min(1, 'Phone is required'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email'),
  condition: z
    .string({ error: 'Condition is required' })
    .trim()
    .min(1, 'Condition is required'),
});

export const updatePatientSchema = createPatientSchema.extend({
  doctor: objectIdSchema('doctor id'),
});

export const patientQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional().transform(emptyToUndefined),
  condition: z.string().trim().optional().transform(emptyToUndefined),
  doctor: z
    .string()
    .trim()
    .optional()
    .transform(emptyToUndefined)
    .pipe(objectIdSchema('doctor id').optional()),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z
    .string()
    .trim()
    .optional()
    .transform((value) => emptyToUndefined(value) ?? '-createdAt'),
});

export const patientIdSchema = z.object({
  id: objectIdSchema('patient id'),
});

export const doctorPatientsQuerySchema = paginationQuerySchema;

export const doctorPatientParamsSchema = z.object({
  id: objectIdSchema('doctor id'),
});

export const doctorPatientIdParamsSchema = z.object({
  id: objectIdSchema('doctor id'),
  patientId: objectIdSchema('patient id'),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type PatientQueryInput = z.infer<typeof patientQuerySchema>;
export type DoctorPatientsQueryInput = z.infer<typeof doctorPatientsQuerySchema>;
