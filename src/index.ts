import { Bot } from 'grammy';
import { setupBotHandlers } from './bot.js';
import { env } from './config.js';

const bot = new Bot(env.BOT_TOKEN);
setupBotHandlers(bot);

bot.start();
console.log('Bot started...');