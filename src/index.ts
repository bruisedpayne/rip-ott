import { Bot } from 'grammy';
import { setupBotHandlers } from './bot.js';
import { env } from './env.js';

const bot = new Bot(env.BOT_TOKEN);
setupBotHandlers(bot);

bot.start();
console.log('Bot started...');