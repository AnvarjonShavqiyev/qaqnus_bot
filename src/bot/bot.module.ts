import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { PrismaService } from '../prisma/prisma.service';
import { sessionMiddleware } from './middlewares/session.middleware';
import { NotificationModule } from 'src/notifications/notification.module';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || '',
      middlewares: [sessionMiddleware],
    }),
    NotificationModule
  ],
  providers: [BotUpdate, BotService, PrismaService],
})
export class BotModule {}
