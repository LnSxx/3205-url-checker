import { Injectable, Logger } from '@nestjs/common';
import { JobsStore } from './jobs.store';
import { JobStatus } from './domain/enums/job-status.enum';
import { Job } from './domain/models/job.model';
import { UrlCheckStatus } from './domain/enums/url-check-status.enum';
import { UrlCheck } from './domain/models/url-check.model';
import { calculateJobStats } from './domain/helpers/job-stats.utils';
import {
  HEAD_REQUEST_TIMEOUT_MS,
  MAX_CONCURRENT_URL_CHECKS,
  MAX_RESULT_DELAY_MS,
} from './jobs.constants';

@Injectable()
export class JobsProcessor {
  private readonly logger = new Logger(JobsProcessor.name);
  private readonly activeControllers = new Map<string, Set<AbortController>>();

  constructor(private readonly jobsStore: JobsStore) {}

  async process(jobId: string): Promise<void> {
    const job = this.jobsStore.findById(jobId);

    if (job.status !== JobStatus.Pending) {
      return;
    }

    this.jobsStore.setJobStatus(job.id, JobStatus.InProgress);
    this.activeControllers.set(job.id, new Set());

    try {
      await this.processWithConcurrencyLimit(job);

      const latestJob = this.jobsStore.findById(job.id);
      const stats = calculateJobStats(latestJob);

      if (latestJob.cancelRequested) {
        this.jobsStore.cancelPendingUrlChecks(latestJob);
        this.jobsStore.setJobStatus(latestJob.id, JobStatus.Cancelled);
        return;
      }

      if (stats.processed === stats.total) {
        this.jobsStore.setJobStatus(latestJob.id, JobStatus.Completed);
      }
    } catch (error) {
      const latestJob = this.jobsStore.findById(job.id);

      if (latestJob.cancelRequested) {
        this.jobsStore.cancelPendingUrlChecks(latestJob);
        this.jobsStore.setJobStatus(latestJob.id, JobStatus.Cancelled);
        return;
      }

      this.logger.error(`Failed to process job ${job.id}`, error);
      this.jobsStore.setJobStatus(job.id, JobStatus.Failed);
    } finally {
      this.activeControllers.delete(job.id);
    }
  }

  cancel(jobId: string): void {
    const controllers = this.activeControllers.get(jobId);

    if (!controllers) {
      return;
    }

    for (const controller of controllers) {
      controller.abort();
    }
  }

  private async processWithConcurrencyLimit(job: Job): Promise<void> {
    let currentIndex = 0;

    const workers = Array.from({ length: MAX_CONCURRENT_URL_CHECKS }, async () => {
      while (currentIndex < job.urls.length) {
        const latestJob = this.jobsStore.findById(job.id);

        if (latestJob.cancelRequested) {
          this.jobsStore.cancelPendingUrlChecks(latestJob);
          return;
        }

        const urlCheck = latestJob.urls[currentIndex];
        currentIndex += 1;

        if (!urlCheck) {
          return;
        }

        if (urlCheck.status !== UrlCheckStatus.Pending) {
          continue;
        }

        await this.processUrl(latestJob.id, urlCheck);
      }
    });

    await Promise.all(workers);
  }

  private async processUrl(jobId: string, urlCheck: UrlCheck): Promise<void> {
    const job = this.jobsStore.findById(jobId);

    if (job.cancelRequested) {
      this.jobsStore.markUrlCancelled(jobId, urlCheck.id);
      return;
    }

    this.jobsStore.markUrlInProgress(jobId, urlCheck.id);

    try {
      const response = await this.head(jobId, urlCheck.url);

      if (this.jobsStore.findById(jobId).cancelRequested) {
        this.jobsStore.markUrlCancelled(jobId, urlCheck.id);
        return;
      }

      const shouldSaveResult = await this.delayBeforeSavingResult(jobId);

      if (!shouldSaveResult) {
        this.jobsStore.markUrlCancelled(jobId, urlCheck.id);
        return;
      }

      if (response.status >= 400) {
        this.jobsStore.markUrlError(
          jobId,
          urlCheck.id,
          `HTTP status ${response.status}`,
          response.status,
        );
        return;
      }

      this.jobsStore.markUrlSuccess(jobId, urlCheck.id, response.status);
    } catch (error) {
      if (this.jobsStore.findById(jobId).cancelRequested) {
        this.jobsStore.markUrlCancelled(jobId, urlCheck.id);
        return;
      }

      const shouldSaveResult = await this.delayBeforeSavingResult(jobId);

      if (!shouldSaveResult) {
        this.jobsStore.markUrlCancelled(jobId, urlCheck.id);
        return;
      }

      this.jobsStore.markUrlError(jobId, urlCheck.id, this.getErrorMessage(error));
    }
  }

  private async head(jobId: string, url: string): Promise<Response> {
    const controller = new AbortController();
    const controllers = this.activeControllers.get(jobId);

    controllers?.add(controller);

    const timeout = setTimeout(() => {
      controller.abort();
    }, HEAD_REQUEST_TIMEOUT_MS);

    try {
      return await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
      controllers?.delete(controller);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  private getRandomResultDelayMs(): number {
    return Math.floor(Math.random() * MAX_RESULT_DELAY_MS);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.name === 'AbortError' ? 'Request timeout' : error.message;
    }

    return 'Unknown error';
  }

  private async delayBeforeSavingResult(jobId: string): Promise<boolean> {
    const delayMs = this.getRandomResultDelayMs();
    const startedAt = Date.now();

    while (Date.now() - startedAt < delayMs) {
      if (this.jobsStore.findById(jobId).cancelRequested) {
        return false;
      }

      await this.delay(100);
    }

    return true;
  }
}
