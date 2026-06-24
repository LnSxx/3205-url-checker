import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { JobsService } from './jobs.service';
import { CreateJobResponseDto } from './dto/create-job-response.dto';
import { JobSummaryResponseDto } from './dto/job-summary-response.dto';
import { JobDetailsResponseDto } from './dto/job-details-response.dto';
import { toJobSummaryResponseDto } from './mappers/job-summary-mapper';
import { toJobDetailsResponseDto } from './mappers/job-details-mapper';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() dto: CreateJobDto): CreateJobResponseDto {
    return this.jobsService.create({
      urls: dto.urls,
    });
  }

  @Get()
  findAll(): JobSummaryResponseDto[] {
    return this.jobsService.findAll().map(toJobSummaryResponseDto);
  }

  @Get(':id')
  findById(@Param('id') id: string): JobDetailsResponseDto {
    return toJobDetailsResponseDto(this.jobsService.findById(id));
  }

  @Delete(':id')
  cancel(@Param('id') id: string): JobDetailsResponseDto {
    return toJobDetailsResponseDto(this.jobsService.cancel(id));
  }
}
