import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsStore } from './jobs.store';
import { JobsProcessor } from './jobs.processor';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsStore, JobsProcessor],
})
export class JobsModule {}
