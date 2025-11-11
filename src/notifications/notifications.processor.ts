import { Process, Processor } from "@nestjs/bull";
import { InjectBot } from "nestjs-telegraf";
import { PrismaService } from "src/prisma/prisma.service";
import { Telegraf } from "telegraf";

@Processor('notifications')
export class NotificationProcessor {
    constructor(
        private prisma: PrismaService,
        @InjectBot() private bot: Telegraf,
    ) { }

    @Process('notify-before-hour')
    async notifyBeforeHour() {
        const spectators = await this.prisma.spectators.findMany({
            select: {
                user: {
                    select: { telegramId: true }
                }
            }
        })

        await Promise.all(
            spectators.map(s =>
                this.bot.telegram.sendMessage(
                    s.user.telegramId,
                    "⚠️ Diqqat! Yangi son boshlanishiga 1 soat qoldi!"
                )
            )
        );
    }
}