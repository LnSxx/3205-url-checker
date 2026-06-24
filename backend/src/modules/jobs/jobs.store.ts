import { Injectable, NotFoundException } from '@nestjs/common';
import { JobStatus } from './domain/job-status.enum';
import { Job } from './domain/job.model';
import { CreateJobParams } from './application/create-job.params';
import { JobSummary } from './domain/job-summary.model';
import { UrlCheck } from './domain/url-check.model';
import { UrlCheckStatus } from './domain/url-check-status.enum';
import { JobDetails } from './domain/job-details.model';
import { createJob } from './application/job.factory';
import { toJobDetails, toJobSummary } from './application/job-read-model.mapper';
import { isFinalJobStatus } from './application/job-status.utils';
import { calculateUrlCheckDurationMs } from './application/url-check.utils';

@Injectable()
export class JobsStore {
  private readonly jobs = new Map<string, Job>();

  create(params: CreateJobParams): Job {
    const job = createJob(params);

    this.jobs.set(job.id, job);

    return job;
  }

  findAll(): JobSummary[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map(toJobSummary);
  }

  findById(id: string): Job {
    const job = this.jobs.get(id);

    if (!job) {
      throw new NotFoundException('Job is not found');
    }

    return job;
  }

  findDetailsById(id: string): JobDetails {
    const job = this.findById(id);

    return toJobDetails(job);
  }

  setJobStatus(id: string, status: JobStatus): Job {
    const job = this.findById(id);

    job.status = status;

    return job;
  }

  requestCancellation(id: string): Job {
    const job = this.findById(id);

    if (isFinalJobStatus(job.status)) {
      return job;
    }

    job.cancelRequested = true;
    job.status = JobStatus.Cancelled;

    this.cancelPendingUrlChecks(job);

    return job;
  }

  markUrlInProgress(jobId: string, urlCheckId: string): UrlCheck {
    const urlCheck = this.findUrlCheck(jobId, urlCheckId);

    urlCheck.status = UrlCheckStatus.InProgress;
    urlCheck.startedAt = new Date().toISOString();

    return urlCheck;
  }

  markUrlSuccess(jobId: string, urlCheckId: string, httpStatus: number): UrlCheck {
    const urlCheck = this.findUrlCheck(jobId, urlCheckId);

    urlCheck.status = UrlCheckStatus.Success;
    urlCheck.httpStatus = httpStatus;
    urlCheck.errorMessage = undefined;
    urlCheck.finishedAt = new Date().toISOString();
    urlCheck.durationMs = calculateUrlCheckDurationMs(urlCheck);

    return urlCheck;
  }

  markUrlError(
    jobId: string,
    urlCheckId: string,
    errorMessage: string,
    httpStatus?: number,
  ): UrlCheck {
    const urlCheck = this.findUrlCheck(jobId, urlCheckId);

    urlCheck.status = UrlCheckStatus.Error;
    urlCheck.httpStatus = httpStatus;
    urlCheck.errorMessage = errorMessage;
    urlCheck.finishedAt = new Date().toISOString();
    urlCheck.durationMs = calculateUrlCheckDurationMs(urlCheck);

    return urlCheck;
  }

  markUrlCancelled(jobId: string, urlCheckId: string): UrlCheck {
    const urlCheck = this.findUrlCheck(jobId, urlCheckId);

    urlCheck.status = UrlCheckStatus.Cancelled;
    urlCheck.finishedAt = new Date().toISOString();
    urlCheck.durationMs = calculateUrlCheckDurationMs(urlCheck);

    return urlCheck;
  }

  cancelPendingUrlChecks(job: Job): void {
    for (const urlCheck of job.urls) {
      if (urlCheck.status === UrlCheckStatus.Pending) {
        urlCheck.status = UrlCheckStatus.Cancelled;
        urlCheck.finishedAt = new Date().toISOString();
      }
    }
  }

  private findUrlCheck(jobId: string, urlCheckId: string): UrlCheck {
    const job = this.findById(jobId);
    const urlCheck = job.urls.find((item) => item.id === urlCheckId);

    if (!urlCheck) {
      throw new NotFoundException('URL check is not found');
    }

    return urlCheck;
  }
}
