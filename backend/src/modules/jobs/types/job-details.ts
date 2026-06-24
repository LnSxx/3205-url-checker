import { JobStatus } from './enums/job-status.enum';
import { UrlCheck } from './url-check';

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
