import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { UserRole } from '../models/User';

export interface JwtPayload {
  userId: string;
  role: UserRole;
}

const JWT_EXPIRES_IN = '7d';

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: JWT_EXPIRES_IN });

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;
