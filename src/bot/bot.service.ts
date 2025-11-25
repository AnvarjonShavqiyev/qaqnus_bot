import { Injectable } from '@nestjs/common';
import {
  ACTIONS,
  DECISIONS,
  ROLES,
  type MyContext,
} from './interfaces/bot-context.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CallbackQuery } from 'telegraf/types';
import { extractFileId } from './helpers';
import {
  adminCommands,
  EMPTY_STRING,
  MAX_SPECTATORS_COUNT,
  MESSAGES,
  userCommands,
  ZERO,
} from 'src/constants';

@Injectable()
export class BotService {
  private currentIndex = ZERO;
  private groups: any[] = [];

  constructor(private prisma: PrismaService) {}

  async handleStart(ctx: MyContext) {
    const telegramId = String(ctx.from!.id);
    const user = await this.prisma.user.findUnique({ where: { telegramId } });

    if (user && user.role === ROLES.ADMIN) {
      return this.sendAdminMenu(ctx);
    }

    if (user && user.role === ROLES.USER) {
      return this.sendMainMenu(ctx);
    } else {
      ctx.session.step = ACTIONS.ASK_NAME;
      return ctx.reply(MESSAGES.ASK_NAME);
    }
  }

  async handleText(ctx: MyContext) {
    const text = (ctx.message as any).text;
    const user = await this.prisma.user.findUnique({
      where: { telegramId: String(ctx.from!.id) },
    });

    switch (ctx.session.step) {
      case ACTIONS.ASK_NAME:
        ctx.session.fullName = text;
        ctx.session.step = ACTIONS.ASK_PASSPORT;
        return ctx.reply(MESSAGES.ASK_PASSPORT);

      case ACTIONS.ASK_PASSPORT:
        ctx.session.passport = text;
        ctx.session.step = ACTIONS.ASK_CONTACT;
        return ctx.reply(MESSAGES.ASK_CONTACT);

      case ACTIONS.ASK_CONTACT:
        await this.prisma.user.create({
          data: {
            telegramId: String(ctx.from!.id),
            fullName: ctx.session.fullName,
            passport: ctx.session.passport,
            contact: text,
          },
        });
        return this.sendMainMenu(ctx);

      case ACTIONS.ASK_WORKS:
        ctx.reply(MESSAGES.ATTENDENSE_NOTE)
    }

    if ((ctx.session.step as ACTIONS) !== ACTIONS.ASK_WORKS) {
      ctx.session = {};
      return this.sendMainMenu(ctx);
    }
  }

  async sendMainMenu(ctx: MyContext) {
    return ctx.reply(MESSAGES.ASK_USER_ROLE, {
      reply_markup: {
        inline_keyboard: userCommands,
      },
    });
  }

  async handleCallbackQuery(ctx: MyContext) {
    const callbackQuery = ctx.callbackQuery as CallbackQuery.DataQuery;
    const data = callbackQuery.data;

    const user = await this.prisma.user.findUnique({
      where: { telegramId: String(ctx.from!.id) },
    });
    if (!user) return ctx.reply(MESSAGES.AUTH_NOTE);

    switch (data) {
      case ACTIONS.SPECTATOR_RECORD:
        const spectators = await this.prisma.spectators.findMany({
          select: { user: { select: { fullName: true, passport: true } } },
        });

        const spectator = await this.prisma.spectators.findFirst({
          where: { userId: user.id },
        });

        if (spectator) {
          return ctx.reply(MESSAGES.USER_UNIQUE_NOTE);
        }

        if (spectators.length >= MAX_SPECTATORS_COUNT)
          return ctx.reply(MESSAGES.NO_PLACE_NOTE);

        await this.prisma.spectators.create({ data: { userId: user.id } });
        return ctx.reply(MESSAGES.SPECTATOR_ANSWER);

      case ACTIONS.ATTENDEE_RECORD:
        await this.prisma.performers.create({
          data: {
            userId: user.id
          }
        })
        return ctx.reply(MESSAGES.ATTENDENSE_NOTE);
    }

    if (user.role === ROLES.ADMIN) {
      switch (data) {
        case ACTIONS.ANNOUNCEMENT:
          await this.prisma.performers.deleteMany();
          await this.prisma.spectators.deleteMany();

          const users = await this.prisma.user.findMany({
            where: { role: ROLES.USER },
          });
          await Promise.all(
            users.map((u) =>
              ctx.telegram.sendMessage(
                u.telegramId,
                MESSAGES.NEW_RECORDING_NOTE,
              ),
            ),
          );
          return ctx.reply(MESSAGES.NEW_ANNOUNCE_NOTE);

        case ACTIONS.LIST_VIEWERS:
          const allSpectators = await this.prisma.spectators.findMany({
            select: { user: { select: { fullName: true, passport: true } } },
          });
          const list = allSpectators.length
            ? allSpectators
                .map(
                  (s, i) => `${i + 1}. ${s.user.fullName} — ${s.user.passport}`,
                )
                .join('\n')
            : MESSAGES.NO_SPECTATORS;
          return ctx.reply(list);

        case ACTIONS.LIST_ATTENDEES:
          const attendees = await this.prisma.performers.findMany({include: {user: true}});
          const message = attendees
            .map((g, i) => {
              return `${i + 1}👤 ${g.user.fullName} - ${g.user.passport} - ${g.user.contact}\n`;
            })
            .join('\n\n');

          return ctx.reply(message.length ? message : MESSAGES.NO_PERFORMERS);

        case ACTIONS.SEND_NOTIFICATION:
          const spectators_list = await this.prisma.spectators.findMany({
            include: { user: true },
          });
          const performers = await this.prisma.performers.findMany({
            include: { user: true },
          });

          await Promise.all(
            [...spectators_list, ...performers].map((u) =>
              ctx.telegram.sendMessage(
                u.user.telegramId,
                MESSAGES.NOTIFICATION,
              ),
            ),
          );

          ctx.reply(MESSAGES.DONE);
      }
    }
  }

  private async sendAdminMenu(ctx: MyContext) {
    return ctx.reply(MESSAGES.CHOOSE_COMMAND, {
      reply_markup: {
        inline_keyboard: adminCommands,
      },
    });
  }
}
