import { z } from 'zod';

export const objectIdSchema = (label = 'id') =>
  z
    .string({ error: `${label} is required` })
    .regex(/^[a-fA-F0-9]{24}$/, `Invalid ${label}`);

export const emptyToUndefined = (value: string | undefined) =>
  value === undefined || value === '' ? undefined : value;

/** Shared list query bounds used by doctors/patients endpoints. */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
