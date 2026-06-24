import { JobDetails } from '../models/job-details.model';
import { JobSummary } from '../models/job-summary.model';
import { Job } from '../models/job.model';
import { calculateJobStats } from './job-stats.utils';

export function toJobSummary(job: Job): JobSummary {
  const stats = calculateJobStats(job);

  return {
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    total: stats.total,
    success: stats.success,
    error: stats.error,
    cancelled: stats.cancelled,
    processed: stats.processed,
  };
}

export function toJobDetails(job: Job): JobDetails {
  const stats = calculateJobStats(job);

  return {
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    total: stats.total,
    pending: stats.pending,
    inProgress: stats.inProgress,
    success: stats.success,
    error: stats.error,
    cancelled: stats.cancelled,
    processed: stats.processed,
    urls: job.urls,
  };
}
