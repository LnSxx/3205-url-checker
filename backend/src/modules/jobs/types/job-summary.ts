import { JobStatus } from './enums/job-status.enum';

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
