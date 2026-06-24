import { JobStats } from '../domain/job-stats.model';
import { Job } from '../domain/job.model';
import { UrlCheckStatus } from '../domain/url-check-status.enum';

export function calculateJobStats(job: Job): JobStats {
  const stats: JobStats = {
    total: job.urls.length,
    pending: 0,
    inProgress: 0,
    success: 0,
    error: 0,
    cancelled: 0,
    processed: 0,
  };

  for (const urlCheck of job.urls) {
    switch (urlCheck.status) {
      case UrlCheckStatus.Pending:
        stats.pending += 1;
        break;
      case UrlCheckStatus.InProgress:
        stats.inProgress += 1;
        break;
      case UrlCheckStatus.Success:
        stats.success += 1;
        stats.processed += 1;
        break;
      case UrlCheckStatus.Error:
        stats.error += 1;
        stats.processed += 1;
        break;
      case UrlCheckStatus.Cancelled:
        stats.cancelled += 1;
        stats.processed += 1;
        break;
    }
  }

  return stats;
}
