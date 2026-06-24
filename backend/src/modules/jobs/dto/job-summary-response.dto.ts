import { JobStatus } from '../types/enums/job-status.enum';

export class JobSummaryResponseDto {
  id!: string;
  createdAt!: string;
  status!: JobStatus;
  total!: number;
  success!: number;
  error!: number;
  cancelled!: number;
  processed!: number;
}
