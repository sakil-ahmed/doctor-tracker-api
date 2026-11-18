import type { NextFunction, Request, Response } from 'express';
import { User } from '../models';
import type { UserRole } from '../models';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import { AUTH_COOKIE_NAME } from '../utils/cookies';
import { verifyToken } from '../utils/jwt';

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;

    if (!token) {
      throw new AppError('Not authenticated', 401);
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }

    const user = await User.findById(payload.userId);

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    req.user = user;
    next();
  }
);

export const authorize = (...roles: UserRole[]) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden: insufficient permissions', 403);
    }

    next();
  });
