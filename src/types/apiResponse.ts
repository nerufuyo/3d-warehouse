export interface APIResponse<T = undefined> {
  timestamp: string;
  data: T;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    isNextPage: boolean;
    isPrevPage: boolean;
  };
  error?: {
    message: string;
    cause?: string;
    stack?: string;
  };
}

export class HttpError extends Error {
  code: number;

  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}
