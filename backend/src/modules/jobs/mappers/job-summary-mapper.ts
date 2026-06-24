import { JobSummaryResponseDto } from '../dto/job-summary-response.dto';
import { JobSummary } from '../types/job-summary';

export function toJobSummaryResponseDto(job: JobSummary): JobSummaryResponseDto {
  return {
    id: job.id,
    createdAt: job.createdAt,
    status: job.status,
    total: job.total,
    success: job.success,
    error: job.error,
    cancelled: job.cancelled,
    processed: job.processed,
  };
}
