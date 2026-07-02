export type ServiceResult<T> = {
  data: T | { error: string };
  status: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total?: number;
  page?: number;
  limit?: number;
};

export type ApiErrorResponse = {
  error: string;
  details?: unknown;
};
