import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { BotModule } from './bot/bot.module';
import { NotificationModule } from './notifications/notification.module';

@Module({
  imports: [BotModule, NotificationModule],
  providers: [PrismaService],
})
export class AppModule {}
