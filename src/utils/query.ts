import { AppError } from './AppError';

export type SortDirection = 1 | -1;

export type DateRangeFilter = {
  $gte?: Date;
  $lte?: Date;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/** Inclusive end-of-day so `to=YYYY-MM-DD` covers the full selected day. */
export const endOfDay = (date: Date): Date => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

export const startOfDay = (date: Date): Date => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

export const buildCreatedAtFilter = (
  from?: Date,
  to?: Date
): DateRangeFilter | undefined => {
  if (!from && !to) {
    return undefined;
  }

  const createdAt: DateRangeFilter = {};
  if (from) {
    createdAt.$gte = startOfDay(from);
  }
  if (to) {
    createdAt.$lte = endOfDay(to);
  }
  return createdAt;
};

export const parseSort = (
  sort: string,
  allowedFields: ReadonlySet<string>
): Record<string, SortDirection> => {
  const direction: SortDirection = sort.startsWith('-') ? -1 : 1;
  const field = sort.replace(/^-/, '');

  if (!allowedFields.has(field)) {
    throw new AppError(`Invalid sort field: ${field}`, 400);
  }

  return { [field]: direction };
};

export const paginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 0,
});

export const paginationSkip = (page: number, limit: number): number =>
  (page - 1) * limit;
