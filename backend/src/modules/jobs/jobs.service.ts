import { Injectable } from '@nestjs/common';
import { JobsProcessor } from './jobs.processor';
import { JobsStore } from './jobs.store';
import { CreateJobParams } from './application/create-job.params';
import { CreateJobResult } from './application/create-job.result';
import { JobSummary } from './domain/models/job-summary.model';
import { JobDetails } from './domain/models/job-details.model';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsStore: JobsStore,
    private readonly jobsProcessor: JobsProcessor,
  ) {}

  create(params: CreateJobParams): CreateJobResult {
    const job = this.jobsStore.create(params);

    void this.jobsProcessor.process(job.id);

    return {
      jobId: job.id,
    };
  }

  findAll(): JobSummary[] {
    return this.jobsStore.findAll();
  }

  findById(id: string): JobDetails {
    return this.jobsStore.findDetailsById(id);
  }

  cancel(id: string): JobDetails {
    this.jobsStore.requestCancellation(id);
    this.jobsProcessor.cancel(id);

    return this.jobsStore.findDetailsById(id);
  }
}
