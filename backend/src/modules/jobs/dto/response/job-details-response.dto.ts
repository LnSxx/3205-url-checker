import { JobStatus } from '../../domain/job-status.enum';
import { UrlCheckResponseDto } from './url-check-response.dto';

export class JobDetailsResponseDto {
  id!: string;
  createdAt!: string;
  status!: JobStatus;
  total!: number;
  pending!: number;
  inProgress!: number;
  success!: number;
  error!: number;
  cancelled!: number;
  processed!: number;
  urls!: UrlCheckResponseDto[];
}
