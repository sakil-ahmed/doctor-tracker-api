import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string({ error: 'Email is required' })
    .trim()
    .email('Please provide a valid email'),
  password: z
    .string({ error: 'Password is required' })
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
