import { Injectable } from '@nestjs/common';
import {
  ACTIONS,
  ROLES,
  type MyContext,
} from './interfaces/bot-context.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { CallbackQuery } from 'telegraf/types';
import {
  adminCommands,
  CHUNK_SIZE,
  MESSAGES,
  ONE,
  userCommands,
} from 'src/constants';
import { chunkArray } from 'src/helpers';

@Injectable()
export class BotService {
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
    let user;
    if (ctx.session.step === ACTIONS.DELETE_USER) {
      user = await this.prisma.user.findUnique({
        where: { id: +text },
      });
    }

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
        ctx.reply(MESSAGES.ATTENDENSE_NOTE);
      case ACTIONS.SEND_MESSAGE:
        ctx.reply(MESSAGES.SEND_MESSAGE_STARTED);
        const users = await this.prisma.user.findMany();
        for (const u of users) {
          try {
            if (u.role !== ROLES.ADMIN) {
              await ctx.telegram.sendMessage(u.telegramId, text);
            }
          } catch (error) {
            console.log(error);
          }
        }
        return ctx.reply(MESSAGES.SENT_MESSAGE);
      case ACTIONS.DELETE_USER:
        ctx.telegram.sendMessage(user.telegramId, MESSAGES.DELETE_USER_NOTE);
        await this.prisma.user.delete({
          where: {
            id: +text,
          },
        });
        return ctx.reply(MESSAGES.DELETE_USER_SUCCESS);
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

    const isRegisterInabled = await this.prisma.settings.findUnique({
      where: { id: ONE },
    });
    const user = await this.prisma.user.findUnique({
      where: { telegramId: String(ctx.from!.id) },
    });
    if (!user) return ctx.reply(MESSAGES.AUTH_NOTE);

    switch (data) {
      case ACTIONS.SPECTATOR_RECORD:
        if (isRegisterInabled) {
          const spectator = await this.prisma.spectators.findFirst({
            where: { userId: user.id },
          });

          if (spectator) {
            return ctx.reply(MESSAGES.USER_UNIQUE_NOTE);
          }

          await this.prisma.spectators.create({ data: { userId: user.id } });
          return ctx.reply(MESSAGES.SPECTATOR_ANSWER);
        } else {
          return ctx.reply(MESSAGES.STOP_RECORDING_NOTE);
        }

      case ACTIONS.ATTENDEE_RECORD:
        if (isRegisterInabled) {
          await this.prisma.performers.create({
            data: {
              userId: user.id,
            },
          });
          return ctx.reply(MESSAGES.ATTENDENSE_NOTE);
        } else {
          return ctx.reply(MESSAGES.STOP_RECORDING_NOTE);
        }
    }

    if (user.role === ROLES.ADMIN) {
      switch (data) {
        case ACTIONS.ANNOUNCEMENT:
          await this.prisma.performers.deleteMany();
          await this.prisma.spectators.deleteMany();
          await this.prisma.settings.upsert({
            where: { id: 1 },
            update: {
              isRegistrationEnabled: true,
            },
            create: {
              id: 1,
              isRegistrationEnabled: true,
            },
          });

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
            select: {
              user: { select: { fullName: true, passport: true, id: true } },
            },
          });
          if (allSpectators.length) {
            const chunks = chunkArray(allSpectators) as any;
            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
              const message = chunks[chunkIndex]
                .map(
                  (s, i) =>
                    `No:${chunkIndex * CHUNK_SIZE + i + 1}👤\n` +
                    `ID: ${s.user.id} | ${s.user.fullName} — ${s.user.passport}`,
                )
                .join('\n\n');

              ctx.reply(message);
            }
          }
          break;

        case ACTIONS.LIST_ATTENDEES:
          const attendees = await this.prisma.performers.findMany({
            include: { user: true },
          });
          if (attendees.length) {
            const chunks = chunkArray(attendees) as any;
            for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex++) {
              const message = chunks[chunkIndex]
                .map(
                  (s, i) =>
                    `No:${chunkIndex * CHUNK_SIZE + i + 1}👤\n` +
                    `ID: ${s.user.id} | ${s.user.fullName} — ${s.user.passport}`,
                )
                .join('\n\n');

              ctx.reply(message);
            }
          }
          break;

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

          return ctx.reply(MESSAGES.DONE);

        case ACTIONS.SEND_MESSAGE:
          ctx.session.step = ACTIONS.SEND_MESSAGE;
          return ctx.reply(MESSAGES.SEND_MESSAGE_NOTE);

        case ACTIONS.DELETE_USER:
          ctx.session.step = ACTIONS.DELETE_USER;
          return ctx.reply(MESSAGES.DELETE_USER);

        case ACTIONS.STOP_RECORDING:
          await this.prisma.settings.upsert({
            where: { id: 1 },
            update: {
              isRegistrationEnabled: false,
            },
            create: {
              id: 1,
              isRegistrationEnabled: false,
            },
          });
          return ctx.reply(MESSAGES.RECORDING_STOPPED);
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
