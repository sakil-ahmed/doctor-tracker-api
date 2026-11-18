import type { Request, Response } from 'express';
import { getCurrentUser, loginUser } from '../services/auth.service';
import { AppError } from '../utils/AppError';
import { asyncHandler } from '../utils/asyncHandler';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieOptions,
} from '../utils/cookies';
import { loginSchema } from '../validators/auth.validator';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, token } = await loginUser(input);

  res.cookie(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged in successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie(AUTH_COOKIE_NAME, getAuthCookieOptions());

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError('Not authenticated', 401);
  }

  const user = await getCurrentUser(req.user._id.toString());

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});
