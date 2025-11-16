import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { BotModule } from './bot/bot.module';
import { AppController } from './app.controller';

@Module({
  imports: [BotModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
