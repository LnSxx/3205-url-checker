import { Injectable, Logger } from '@nestjs/common';
import { JobsStore } from './jobs.store';
import { JobStatus } from './types/job-status.enum';
import { Job, UrlCheck } from './types/job.types';

const MAX_CONCURRENT_URL_CHECKS = 5;
const HEAD_REQUEST_TIMEOUT_MS = 10_000;
const MAX_RESULT_DELAY_MS = 10_000;

@Injectable()
export class JobsProcessor {
  private readonly logger = new Logger(JobsProcessor.name);

  constructor(private readonly jobsStore: JobsStore) {}

  async process(jobId: string): Promise<void> {
    const job = this.jobsStore.findById(jobId);

    if (job.status !== JobStatus.Pending) {
      return;
    }

    this.jobsStore.setJobStatus(job.id, JobStatus.InProgress);

    try {
      await this.processWithConcurrencyLimit(job);

      const latestJob = this.jobsStore.findById(job.id);
      const stats = this.jobsStore.calculateStats(latestJob);

      if (latestJob.cancelRequested) {
        this.jobsStore.setJobStatus(latestJob.id, JobStatus.Cancelled);
        return;
      }

      if (stats.processed === stats.total) {
        this.jobsStore.setJobStatus(latestJob.id, JobStatus.Completed);
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}`, error);
      this.jobsStore.setJobStatus(job.id, JobStatus.Failed);
    }
  }

  private async processWithConcurrencyLimit(job: Job): Promise<void> {
    let currentIndex = 0;

    const workers = Array.from({ length: MAX_CONCURRENT_URL_CHECKS }, async () => {
      while (currentIndex < job.urls.length) {
        if (job.cancelRequested) {
          this.jobsStore.cancelPendingUrlChecks(job);
          return;
        }

        const urlCheck = job.urls[currentIndex];
        currentIndex += 1;

        if (!urlCheck) {
          return;
        }

        await this.processUrl(job.id, urlCheck);
      }
    });

    await Promise.all(workers);
  }

  private async processUrl(jobId: string, urlCheck: UrlCheck): Promise<void> {
    this.jobsStore.markUrlInProgress(jobId, urlCheck.id);

    try {
      const response = await this.head(urlCheck.url);

      await this.delay(this.getRandomResultDelayMs());

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
      await this.delay(this.getRandomResultDelayMs());

      this.jobsStore.markUrlError(jobId, urlCheck.id, this.getErrorMessage(error));
    }
  }

  private async head(url: string): Promise<Response> {
    const controller = new AbortController();
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
}
