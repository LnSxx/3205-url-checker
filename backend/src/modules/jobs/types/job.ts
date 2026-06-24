import { JobStatus } from './enums/job-status.enum';
import { UrlCheck } from './url-check';

export interface Job {
  id: string;
  createdAt: string;
  status: JobStatus;
  urls: UrlCheck[];
  cancelRequested: boolean;
}
