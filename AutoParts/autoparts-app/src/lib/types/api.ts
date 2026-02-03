// Type definitions for API responses

export interface UploadResult {
  success: boolean;
  message: string;
  rowCount: number;
  data?: Record<string, unknown>[];
}

export interface PartsByMakeResult {
  success: boolean;
  count: number;
  data: ServiceLineData[];
}

export interface PartsByServiceLineResult {
  success: boolean;
  data: ServiceLineData;
}

export interface ServiceLineData {
  _id?: string;
  serviceLineId: number;
  make: string;
  model: string;
  year: number;
  type?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

export interface ErrorResult {
  error: string;
}
