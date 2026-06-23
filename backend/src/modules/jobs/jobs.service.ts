import { Injectable } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsProcessor } from './jobs.processor';
import { JobsStore } from './jobs.store';
import { JobDetails, JobSummary } from './types/job.types';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsStore: JobsStore,
    private readonly jobsProcessor: JobsProcessor,
  ) {}

  create(dto: CreateJobDto): { jobId: string } {
    const job = this.jobsStore.create(dto);

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

    return this.jobsStore.findDetailsById(id);
  }
}
