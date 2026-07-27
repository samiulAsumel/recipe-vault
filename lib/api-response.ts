import { NextResponse } from 'next/server';

interface ApiSuccessBody<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: { total: number };
}

interface ApiErrorBody {
  success: false;
  error: string;
  message: string;
  details: unknown[];
}

export function apiSuccess<T>(
  data: T,
  options?: { message?: string; pagination?: { total: number }; status?: number },
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = { success: true, data };
  if (options?.message) body.message = options.message;
  if (options?.pagination) body.pagination = options.pagination;

  return NextResponse.json(body, { status: options?.status ?? 200 });
}

export function apiError(
  status: number,
  error: string,
  message: string,
  details: unknown[] = [],
): NextResponse<ApiErrorBody> {
  return NextResponse.json({ success: false, error, message, details }, { status });
}
