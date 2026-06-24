import { Injectable } from '@nestjs/common';
import { JobsProcessor } from './jobs.processor';
import { JobsStore } from './jobs.store';
import { CreateJobCommand, CreateJobResult } from './types/create-job.types';
import { JobSummary } from './types/job-summary';
import { JobDetails } from './types/job-details';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsStore: JobsStore,
    private readonly jobsProcessor: JobsProcessor,
  ) {}

  create(params: CreateJobCommand): CreateJobResult {
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
