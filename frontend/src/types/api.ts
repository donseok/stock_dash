/** API response types */

export interface ApiResponse<T> {
  data: T;
  status: "success" | "error";
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  status: "error";
  message: string;
  code?: string;
  timestamp: string;
}
