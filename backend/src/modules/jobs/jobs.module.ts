import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JobsStore } from './jobs.store';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsStore],
})
export class JobsModule {}
