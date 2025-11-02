import { Bot } from 'grammy';
import axios from 'axios';
import { addMagnetLink, addTorrentFile, unrestrictLink, getTorrentInfo, selectFiles } from './api.js';
import { isMagnetLink, formatTorrentStatus } from './util.js';
import { env } from './env.js';

export function setupBotHandlers(bot: Bot) {
  async function handleTorrentPostProcessing(torrentId: string, ctx: any) {
    await ctx.reply(`✅ Torrent added successfully!\n\nID: ${torrentId}\n`);
    
    await ctx.reply('Selecting all files to start download...');
    await selectFiles(torrentId);
    await ctx.reply('✅ All files selected! Download started.');
    
    const torrent = await getTorrentInfo(torrentId);
    const statusMessage = formatTorrentStatus(torrent);
    await ctx.reply(statusMessage, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
  }

  bot.command('torrent', async (ctx) => {
    if (!ctx.message?.text) return;
    
    const magnetLink = ctx.message.text.substring('/torrent '.length).trim();
    
    if (!magnetLink) {
      await ctx.reply('Usage: /torrent <magnet_link>');
      return;
    }
    
    if (!isMagnetLink(magnetLink)) {
      await ctx.reply('Please provide a valid magnet link starting with "magnet:"');
      return;
    }

    try {
      await ctx.reply('Processing magnet link...');
      const result = await addMagnetLink(magnetLink);
      await handleTorrentPostProcessing(result.id, ctx);
    } catch (error: any) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  });

  bot.command('status', async (ctx) => {
    if (!ctx.message?.text) return;
    
    const torrentId = ctx.message.text.substring('/status '.length).trim();
    
    if (!torrentId) {
      await ctx.reply('Usage: /status <torrent_id>');
      return;
    }

    try {
      await ctx.reply('Fetching torrent status...');
      const torrent = await getTorrentInfo(torrentId);
      const statusMessage = formatTorrentStatus(torrent);
      await ctx.reply(statusMessage, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
    } catch (error: any) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  });

  bot.command('download', async (ctx) => {
    if (!ctx.message?.text) return;
    
    const link = ctx.message.text.substring('/download '.length).trim();
    
    if (!link) {
      await ctx.reply('Usage: /download <hoster_link>');
      return;
    }

    try {
      await ctx.reply('🚀 Processing link...');
      const result = await unrestrictLink(link);
      await ctx.reply(`🎉 Download ready!\n\n${result.download}`, { link_preview_options: { is_disabled: true} });
    } catch (error: any) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  });

  bot.on('message:document', async (ctx) => { 
    const document = ctx.message.document;
    
    if (document.mime_type !== "application/x-bittorrent") {
      await ctx.reply(`Expected torrent file, received: ${document.mime_type}`);
      return;
    }

    try {
      await ctx.reply('Processing torrent file...');
      const file = await ctx.api.getFile(document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`;
     
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(response.data);
     
      const result = await addTorrentFile(fileBuffer);
      await handleTorrentPostProcessing(result.id, ctx);
    } catch (error: any) {
      await ctx.reply(`❌ Error: ${error.message}`);
    }
  });
}