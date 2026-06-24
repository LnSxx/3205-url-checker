import type { JobStatus } from '../api/jobs.types';

export function isFinalJobStatus(status: JobStatus): boolean {
  return ['completed', 'cancelled', 'failed'].includes(status);
}
