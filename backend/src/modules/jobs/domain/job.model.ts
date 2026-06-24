import { JobStatus } from './job-status.enum';
import { UrlCheck } from './url-check.model';

export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheck[];
  cancelRequested: boolean;
}
