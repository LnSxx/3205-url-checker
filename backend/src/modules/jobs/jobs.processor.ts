import { Injectable, Logger } from '@nestjs/common';
import { JobsStore } from './jobs.store';
import { JobStatus } from './domain/enums/job-status.enum';
import { UrlCheckStatus } from './domain/enums/url-check-status.enum';
import { UrlCheck } from './domain/models/url-check.model';
import { calculateJobStats } from './domain/helpers/job-stats.utils';
import {
  CANCELLATION_CHECK_INTERVAL_MS,
  HEAD_REQUEST_TIMEOUT_MS,
  JOB_URL_CONCURRENCY_LIMIT,
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
      await this.processJobUrls(job.id);
      this.finalizeJob(job.id);
    } catch (error) {
      this.failJob(job.id, error);
    } finally {
      this.activeControllers.delete(job.id);
    }
  }

  cancel(jobId: string): void {
    for (const controller of this.activeControllers.get(jobId) ?? []) {
      controller.abort();
    }
  }

  private async processJobUrls(jobId: string): Promise<void> {
    let currentIndex = 0;

    const workers = Array.from({ length: JOB_URL_CONCURRENCY_LIMIT }, async () => {
      while (true) {
        const latestJob = this.jobsStore.findById(jobId);

        if (latestJob.cancelRequested) {
          this.jobsStore.cancelPendingUrlChecks(latestJob);
          return;
        }

        if (currentIndex >= latestJob.urls.length) {
          return;
        }

        const urlCheck = latestJob.urls[currentIndex];
        currentIndex += 1;

        if (urlCheck.status !== UrlCheckStatus.Pending) {
          continue;
        }

        await this.processUrl(latestJob.id, urlCheck);
      }
    });

    await Promise.all(workers);
  }

  private async processUrl(jobId: string, urlCheck: UrlCheck): Promise<void> {
    if (this.isJobCancellationRequested(jobId)) {
      this.jobsStore.markUrlCancelled(jobId, urlCheck.id);
      return;
    }

    this.jobsStore.markUrlInProgress(jobId, urlCheck.id);

    try {
      const response = await this.head(jobId, urlCheck.url);

      if (this.isJobCancellationRequested(jobId)) {
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
      if (this.isJobCancellationRequested(jobId)) {
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
    const controller = this.registerAbortController(jobId);
    let didTimeout = false;

    const timeout = setTimeout(() => {
      didTimeout = true;
      controller.abort();
    }, HEAD_REQUEST_TIMEOUT_MS);

    try {
      return await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: controller.signal,
      });
    } catch (error) {
      if (didTimeout) {
        throw new Error('Request timeout');
      }

      throw error;
    } finally {
      clearTimeout(timeout);
      this.unregisterAbortController(jobId, controller);
    }
  }

  private finalizeJob(jobId: string): void {
    const job = this.jobsStore.findById(jobId);
    const stats = calculateJobStats(job);

    if (job.cancelRequested) {
      this.jobsStore.cancelPendingUrlChecks(job);
      this.jobsStore.setJobStatus(job.id, JobStatus.Cancelled);
      return;
    }

    if (stats.processed === stats.total) {
      this.jobsStore.setJobStatus(job.id, JobStatus.Completed);
    }
  }

  private failJob(jobId: string, error: unknown): void {
    const job = this.jobsStore.findById(jobId);

    if (job.cancelRequested) {
      this.jobsStore.cancelPendingUrlChecks(job);
      this.jobsStore.setJobStatus(job.id, JobStatus.Cancelled);
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    this.logger.error(`Failed to process job ${job.id}: ${message}`, stack);
    this.jobsStore.setJobStatus(job.id, JobStatus.Failed);
  }

  private registerAbortController(jobId: string): AbortController {
    const controller = new AbortController();

    let controllers = this.activeControllers.get(jobId);

    if (!controllers) {
      controllers = new Set();
      this.activeControllers.set(jobId, controllers);
    }

    controllers.add(controller);

    return controller;
  }

  private unregisterAbortController(jobId: string, controller: AbortController): void {
    this.activeControllers.get(jobId)?.delete(controller);
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
    return error instanceof Error ? error.message : 'Unknown error';
  }

  private isJobCancellationRequested(jobId: string): boolean {
    return this.jobsStore.findById(jobId).cancelRequested;
  }

  private async delayBeforeSavingResult(jobId: string): Promise<boolean> {
    const delayMs = this.getRandomResultDelayMs();
    const startedAt = Date.now();

    while (Date.now() - startedAt < delayMs) {
      if (this.isJobCancellationRequested(jobId)) {
        return false;
      }

      const elapsedMs = Date.now() - startedAt;
      const remainingMs = delayMs - elapsedMs;
      const nextDelayMs = Math.min(CANCELLATION_CHECK_INTERVAL_MS, remainingMs);

      await this.delay(nextDelayMs);
    }

    return true;
  }
}
