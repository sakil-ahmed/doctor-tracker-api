import type { CookieOptions } from 'express';
import { env } from '../config/env';

export const AUTH_COOKIE_NAME = 'token';

export const AUTH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const getAuthCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  maxAge: AUTH_COOKIE_MAX_AGE_MS,
  path: '/',
});
