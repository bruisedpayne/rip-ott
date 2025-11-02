import { config } from 'dotenv';
import { Bot } from 'grammy';
import { setupBotHandlers } from './bot.js';

config();

const bot = new Bot(process.env.BOT_TOKEN!);

setupBotHandlers(bot);

bot.start();
console.log('Bot started...');