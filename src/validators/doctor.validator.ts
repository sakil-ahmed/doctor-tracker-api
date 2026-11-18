import { z } from 'zod';
import {
  emptyToUndefined,
  objectIdSchema,
  paginationQuerySchema,
} from './common.validator';

export const createDoctorSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  specialization: z
    .string({ error: 'Specialization is required' })
    .trim()
    .min(1, 'Specialization is required'),
  hospital: z
    .string({ error: 'Hospital is required' })
    .trim()
    .min(1, 'Hospital is required'),
  phone: z.string({ error: 'Phone is required' }).trim().min(1, 'Phone is required'),
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email'),
});

export const doctorQuerySchema = paginationQuerySchema.extend({
  search: z.string().trim().optional().transform(emptyToUndefined),
  specialization: z.string().trim().optional().transform(emptyToUndefined),
  hospital: z.string().trim().optional().transform(emptyToUndefined),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  sort: z
    .string()
    .trim()
    .optional()
    .transform((value) => emptyToUndefined(value) ?? '-createdAt'),
});

export const doctorIdSchema = z.object({
  id: objectIdSchema('doctor id'),
});

export type CreateDoctorInput = z.infer<typeof createDoctorSchema>;
export type DoctorQueryInput = z.infer<typeof doctorQuerySchema>;
