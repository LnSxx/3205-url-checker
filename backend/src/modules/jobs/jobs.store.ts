import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateJobDto } from './dto/create-job.dto';
import { JobStatus } from './types/job-status.enum';
import { UrlCheckStatus } from './types/url-check-status.enum';
import { Job, JobDetails, JobStats, JobSummary, UrlCheck } from './types/job.types';

@Injectable()
export class JobsStore {
  private readonly jobs = new Map<string, Job>();

  create(dto: CreateJobDto): Job {
    const now = new Date().toISOString();

    const job: Job = {
      id: randomUUID(),
      createdAt: now,
      status: JobStatus.Pending,
      cancelRequested: false,
      urls: dto.urls.map((url) => this.createUrlCheck(url)),
    };

    this.jobs.set(job.id, job);

    return job;
  }

  findAll(): JobSummary[] {
    return Array.from(this.jobs.values())
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((job) => this.toSummary(job));
  }

  findById(id: string): Job {
    const job = this.jobs.get(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  findDetailsById(id: string): JobDetails {
    return this.toDetails(this.findById(id));
  }

  setJobStatus(id: string, status: JobStatus): Job {
    const job = this.findById(id);

    job.status = status;

    return job;
  }

  requestCancellation(id: string): Job {
    const job = this.findById(id);

    if (this.isFinalJobStatus(job.status)) {
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
    urlCheck.durationMs = this.calculateDurationMs(urlCheck);

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
    urlCheck.durationMs = this.calculateDurationMs(urlCheck);

    return urlCheck;
  }

  markUrlCancelled(jobId: string, urlCheckId: string): UrlCheck {
    const urlCheck = this.findUrlCheck(jobId, urlCheckId);

    urlCheck.status = UrlCheckStatus.Cancelled;
    urlCheck.finishedAt = new Date().toISOString();
    urlCheck.durationMs = this.calculateDurationMs(urlCheck);

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

  calculateStats(job: Job): JobStats {
    const stats: JobStats = {
      total: job.urls.length,
      pending: 0,
      inProgress: 0,
      success: 0,
      error: 0,
      cancelled: 0,
      processed: 0,
    };

    for (const urlCheck of job.urls) {
      switch (urlCheck.status) {
        case UrlCheckStatus.Pending:
          stats.pending += 1;
          break;
        case UrlCheckStatus.InProgress:
          stats.inProgress += 1;
          break;
        case UrlCheckStatus.Success:
          stats.success += 1;
          stats.processed += 1;
          break;
        case UrlCheckStatus.Error:
          stats.error += 1;
          stats.processed += 1;
          break;
        case UrlCheckStatus.Cancelled:
          stats.cancelled += 1;
          stats.processed += 1;
          break;
      }
    }

    return stats;
  }

  private createUrlCheck(url: string): UrlCheck {
    return {
      id: randomUUID(),
      url,
      status: UrlCheckStatus.Pending,
    };
  }

  private findUrlCheck(jobId: string, urlCheckId: string): UrlCheck {
    const job = this.findById(jobId);
    const urlCheck = job.urls.find((item) => item.id === urlCheckId);

    if (!urlCheck) {
      throw new NotFoundException('URL check not found');
    }

    return urlCheck;
  }

  private toSummary(job: Job): JobSummary {
    const stats = this.calculateStats(job);

    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      total: stats.total,
      success: stats.success,
      error: stats.error,
      cancelled: stats.cancelled,
      processed: stats.processed,
    };
  }

  private toDetails(job: Job): JobDetails {
    const stats = this.calculateStats(job);

    return {
      id: job.id,
      createdAt: job.createdAt,
      status: job.status,
      total: stats.total,
      pending: stats.pending,
      inProgress: stats.inProgress,
      success: stats.success,
      error: stats.error,
      cancelled: stats.cancelled,
      processed: stats.processed,
      urls: job.urls,
    };
  }

  private calculateDurationMs(urlCheck: UrlCheck): number | undefined {
    if (!urlCheck.startedAt || !urlCheck.finishedAt) {
      return undefined;
    }

    return new Date(urlCheck.finishedAt).getTime() - new Date(urlCheck.startedAt).getTime();
  }

  private isFinalJobStatus(status: JobStatus): boolean {
    return [JobStatus.Completed, JobStatus.Cancelled, JobStatus.Failed].includes(status);
  }
}
