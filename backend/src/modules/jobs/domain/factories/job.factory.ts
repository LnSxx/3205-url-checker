import { randomUUID } from 'crypto';
import { CreateJobParams } from '../../application/create-job.params';
import { JobStatus } from '../enums/job-status.enum';
import { Job } from '../models/job.model';
import { UrlCheck } from '../models/url-check.model';
import { UrlCheckStatus } from '../enums/url-check-status.enum';

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
