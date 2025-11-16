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
        const userWorks = await this.prisma.works.findMany({
          where: {
            AND: [
              { userId: user?.id },
              {
                OR: [{ status: 'ACCEPTED' }, { status: 'REJECTED' }],
              },
            ],
          },
        });

        if (userWorks.length) {
          return ctx.reply(MESSAGES.USER_COMPLETNESS_WORK);
        }

        const { fileId, textWork } = extractFileId(ctx.message) as any;
        ctx.reply(MESSAGES.SAVE_NOTE);
        await this.prisma.works.create({
          data: { userId: user!.id, fileId, text: textWork },
        });

        return ctx.reply(MESSAGES.SAVED_NOTE);
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
        ctx.session.step = ACTIONS.ASK_WORKS;
        return ctx.reply(MESSAGES.ASK_WORKS);
    }

    if (user.role === ROLES.ADMIN) {
      switch (data) {
        case ACTIONS.ANNOUNCEMENT:
          await this.prisma.works.deleteMany();
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

        case ACTIONS.SORTING:
          return this.startSorting(ctx);

        case ACTIONS.LIST_ATTENDEES:
          const attendees = await this.getAcceptedUsers();
          const message = Object.values(attendees)
            .map((g, i) => {
              return `${i + 1}👤 ${g.user.fullName} - ${g.user.passport} - ${g.user.contact}\n`;
            })
            .join('\n\n');

          return ctx.reply(message);

        case ACTIONS.SEND_NOTIFICATION:
          const attendees_list = await this.getAcceptedUsers();
          const spectators_list = await this.prisma.spectators.findMany({
            include: { user: true },
          });

          await Promise.all(
            [...spectators_list].map((u) =>
              ctx.telegram.sendMessage(
                u.user.telegramId,
                MESSAGES.NOTIFICATION,
              ),
            ),
          );

          await Promise.all(
            Object.values(attendees_list).map((user) => {
              ctx.telegram.sendMessage(
                user.user.telegramId,
                MESSAGES.NOTIFICATION,
              );
            }),
          );

          ctx.reply(MESSAGES.DONE);
      }

      if (data === DECISIONS.ACCEPTED || data === DECISIONS.REJECTED) {
        return this.handleSortingDecision(ctx, data);
      }
    }
  }

  private async startSorting(ctx: MyContext) {
    const pendingWorks = await this.prisma.works.findMany({
      where: { status: 'PENDING' },
      include: { user: true },
    });

    if (pendingWorks.length === ZERO) {
      this.currentIndex = ZERO;
      this.groups = [];
      return ctx.reply(MESSAGES.SORTING_COMPLETED);
    }

    const grouped = pendingWorks.reduce(
      (acc, w) => {
        if (!acc[w.userId]) acc[w.userId] = [];
        acc[w.userId].push(w);
        return acc;
      },
      {} as Record<number, typeof pendingWorks>,
    );

    this.groups = Object.values(grouped);
    this.currentIndex = ZERO;

    await this.showCurrentGroup(ctx);
  }

  private async showCurrentGroup(ctx: MyContext) {
    if (this.currentIndex >= this.groups.length) {
      this.currentIndex = ZERO;
      this.groups = [];
    }

    if (!this.groups.length || this.currentIndex >= this.groups.length) {
      this.currentIndex = ZERO;
      return ctx.reply(MESSAGES.CHECKED_ALL);
    }

    const group = this.groups[this.currentIndex];
    const user = group[ZERO].user;
    const chatId = ctx.chat?.id ?? ctx.from?.id;
    if (!chatId) return;

    await ctx.reply(
      `👤 User: ${user.fullName}\n📌 Ishlar soni: ${group.length}`,
    );

    for (const work of group) {
      if (work.fileId) {
        await ctx.telegram.sendDocument(chatId, work.fileId, {
          caption: work.text ?? EMPTY_STRING,
        });
      } else if (work.text) {
        await ctx.telegram.sendMessage(chatId, work.text);
      }
    }

    await ctx.telegram.sendMessage(chatId, MESSAGES.ACCEPT_REJECT, {
      reply_markup: {
        inline_keyboard: [
          [
            { text: MESSAGES.ACCEPT, callback_data: DECISIONS.ACCEPTED },
            { text: MESSAGES.REJECT, callback_data: DECISIONS.REJECTED },
          ],
        ],
      },
    });
  }

  private async handleSortingDecision(ctx: MyContext, action: string) {
    const group = this.groups[this.currentIndex];
    const userTelegramId = group[0].user.telegramId;

    await this.prisma.works.updateMany({
      where: { id: { in: group?.map((w) => w.id) } },
      data: { status: action === 'ACCEPTED' ? 'ACCEPTED' : 'REJECTED' },
    });

    await ctx.reply(
      action === DECISIONS.ACCEPTED
        ? MESSAGES.ACCEPT_NOTE
        : MESSAGES.REJECT_NOTE,
    );

    await ctx.telegram.sendMessage(
      userTelegramId,
      action === DECISIONS.ACCEPTED
        ? MESSAGES.USER_ACCEPT_NOTE
        : MESSAGES.USER_REJECT_NOTE,
    );

    this.currentIndex++;
    return this.showCurrentGroup(ctx);
  }

  async completeRecivingWorks(ctx: MyContext) {
    ctx.reply(MESSAGES.COMPLETE_WORKS);
  }

  async completeSorting(ctx: MyContext) {
    ctx.reply(MESSAGES.COMPLETE_NOTE);
    return this.sendAdminMenu(ctx);
  }

  private async sendAdminMenu(ctx: MyContext) {
    return ctx.reply(MESSAGES.CHOOSE_COMMAND, {
      reply_markup: {
        inline_keyboard: adminCommands,
      },
    });
  }

  private async getAcceptedUsers() {
    const acceptedWorks = await this.prisma.works.findMany({
      where: { status: 'ACCEPTED' },
      include: { user: true },
    });

    const groupedByUser = acceptedWorks.reduce(
      (acc, work) => {
        const userId = work.userId;
        if (!acc[userId]) acc[userId] = { user: work.user, works: [] };
        acc[userId].works.push(work);
        return acc;
      },
      {} as Record<number, { user: any; works: typeof acceptedWorks }>,
    );

    return groupedByUser;
  }
}
