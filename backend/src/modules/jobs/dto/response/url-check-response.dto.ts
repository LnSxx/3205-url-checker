import { UrlCheckStatus } from '../../domain/url-check-status.enum';

export class UrlCheckResponseDto {
  id!: string;
  url!: string;
  status!: UrlCheckStatus;
  httpStatus?: number;
  errorMessage?: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
}
