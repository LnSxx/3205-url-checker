import { JobDetails } from '../domain/job-details.model';
import { JobDetailsResponseDto } from '../dto/response/job-details-response.dto';
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
