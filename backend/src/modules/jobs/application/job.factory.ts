import { randomUUID } from 'crypto';
import { CreateJobParams } from './create-job.params';
import { JobStatus } from '../domain/job-status.enum';
import { Job } from '../domain/job.model';
import { UrlCheck } from '../domain/url-check.model';
import { UrlCheckStatus } from '../domain/url-check-status.enum';

export function createJob(params: CreateJobParams): Job {
  return {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    status: JobStatus.Pending,
    cancelRequested: false,
    urls: params.urls.map(createUrlCheck),
  };
}

function createUrlCheck(url: string): UrlCheck {
  return {
    id: randomUUID(),
    url,
    status: UrlCheckStatus.Pending,
  };
}
