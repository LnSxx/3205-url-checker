import { JobDetailsResponseDto } from '../dto/job-details-response.dto';
import { JobDetails } from '../types/job-details';
import { toUrlCheckResponseDto } from './url-check-mapper';

export function toJobDetailsResponseDto(job: JobDetails): JobDetailsResponseDto {
  return {
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    total: job.total,
    pending: job.pending,
    inProgress: job.inProgress,
    success: job.success,
    error: job.error,
    cancelled: job.cancelled,
    processed: job.processed,
    urls: job.urls.map(toUrlCheckResponseDto),
  };
}
