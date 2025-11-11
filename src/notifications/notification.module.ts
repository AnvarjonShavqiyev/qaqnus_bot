import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationProcessor } from './notifications.processor';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
    
  ],
  providers: [NotificationProcessor, PrismaService],
  exports: [BullModule],
})
export class NotificationModule {}
