import { JobSummary } from '../domain/models/job-summary.model';
import { JobSummaryResponseDto } from '../dto/response/job-summary-response.dto';

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
