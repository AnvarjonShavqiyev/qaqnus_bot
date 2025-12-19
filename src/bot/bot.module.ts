import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { BotUpdate } from './bot.update';
import { BotService } from './bot.service';
import { PrismaService } from '../prisma/prisma.service';
import { EMPTY_STRING } from 'src/constants';
import { session } from 'telegraf';

@Module({
  imports: [
    TelegrafModule.forRoot({
      token: process.env.BOT_TOKEN || EMPTY_STRING,
      middlewares: [session()],
    }),
  ],
  providers: [BotUpdate, BotService, PrismaService],
})
export class BotModule {}
