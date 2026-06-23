import { JobStatus } from './job-status.enum';
import { UrlCheckStatus } from './url-check-status.enum';

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

export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheck[];
  cancelRequested: boolean;
}

export interface JobStats {
  total: number;
  pending: number;
  inProgress: number;
  success: number;
  error: number;
  cancelled: number;
  processed: number;
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
