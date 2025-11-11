import { Update, Start, On, Ctx, Command } from 'nestjs-telegraf';
import { BotService } from './bot.service';
import { MyContext } from './interfaces/bot-context.interface';

@Update()
export class BotUpdate {
  constructor(private botService: BotService) {}

  @Start()
  async start(@Ctx() ctx: MyContext) {
    this.botService.handleStart(ctx);
  }

  
  @Command('saqlash')
  async completeRecivingWorks(@Ctx() ctx: MyContext) {
    this.botService.completeRecivingWorks(ctx)
  }

  @Command('tugatish')
  async completeSorting(@Ctx() ctx: MyContext) {
    this.botService.completeSorting(ctx)
  }

  @On('message')
  async onMessage(@Ctx() ctx: MyContext) {
    this.botService.handleText(ctx);
  }

  @On('callback_query')
  async onCallbackQuery(@Ctx() ctx: MyContext) {
    this.botService.handleCallbackQuery(ctx);
  }

}
