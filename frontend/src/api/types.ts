export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';

export type UrlCheckStatus = 'pending' | 'in_progress' | 'success' | 'error' | 'cancelled';

export interface UrlCheck {
  id: string;
  url: string;
  status: UrlCheckStatus;
  httpStatus?: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}

export interface JobSummary {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  success: number;
  error: number;
  cancelled: number;
  processed: number;
}

export interface JobDetails {
  id: string;
  createdAt: string;
  status: JobStatus;
  total: number;
  pending: number;
  inProgress: number;
  success: number;
  error: number;
  cancelled: number;
  processed: number;
  urls: UrlCheck[];
}

export interface CreateJobRequest {
  urls: string[];
}

export interface CreateJobResponse {
  jobId: string;
}
