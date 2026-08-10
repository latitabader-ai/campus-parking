// src/utils/pagination.ts
// Cursor-based pagination helpers for large tables (spaces, violations).

export interface PaginationParams {
  page: number;
  limit: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10));
  const limit = Math.min(100, Math.max(1, parseInt(String(query.limit ?? '20'), 10)));
  return { page, limit };
}

export function toPaginationMeta(total: number, page: number, limit: number) {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export function toSkipTake(page: number, limit: number) {
  return { skip: (page - 1) * limit, take: limit };
}
