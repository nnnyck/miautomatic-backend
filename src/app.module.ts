import { Module } from '@nestjs/common';
import { FeedingModule } from './feeding/feeding.module';

@Module({
  imports: [FeedingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
