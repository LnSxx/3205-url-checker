import { Module } from '@nestjs/common';
import { JobsModule } from './modules/jobs/jobs.module';

@Module({
  imports: [JobsModule],
})
export class AppModule {}
