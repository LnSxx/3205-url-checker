import { JobStatus } from '../enums/job-status.enum';

export function isFinalJobStatus(status: JobStatus): boolean {
  return [JobStatus.Completed, JobStatus.Cancelled, JobStatus.Failed].includes(status);
}
