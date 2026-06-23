import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';
import type { JobDetails, JobSummary } from './types/job.types';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto): { jobId: string } {
    return this.jobsService.create(dto);
  }

  @Get()
  findAll(): JobSummary[] {
    return this.jobsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string): JobDetails {
    return this.jobsService.findById(id);
  }

  @Delete(':id')
  cancel(@Param('id') id: string): JobDetails {
    return this.jobsService.cancel(id);
  }
}
