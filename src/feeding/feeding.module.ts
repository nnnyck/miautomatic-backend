import { Module } from '@nestjs/common';
import { FeedingController } from './feeding.controller';
import { FeedingService } from './feeding.service';

@Module({
  imports: [],
  controllers: [FeedingController],
  providers: [FeedingService],
})
export class FeedingModule {}
