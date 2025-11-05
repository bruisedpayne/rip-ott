import { Bot, Context } from 'grammy';
import axios from 'axios';
import { addMagnetLink, addTorrentFile, unrestrictLink, getTorrentInfo, selectFiles } from './api.js';
import { isMagnetLink, formatTorrentStatus, formatBytes } from './util.js';
import { env } from './config.js';
import { startMessage } from './messages/start.js';
import { helpMessage } from './messages/help.js';

export function setupBotHandlers(bot: Bot) {
async function handleTorrentPostProcessing(torrentId: string, ctx: any) {
    await sendReply(ctx, `✅ Torrent added successfully!\n\nID: ${torrentId}\n`);
    
    await sendReply(ctx, 'Selecting all files to start download...');
    await selectFiles(torrentId);
    await sendReply(ctx, '✅ All files selected! Download started.');
    
    const torrent = await getTorrentInfo(torrentId);
    const statusMessage = formatTorrentStatus(torrent);
    await sendReply(ctx, statusMessage);
  }

bot.command('start', async (ctx) => {
    await sendReply(ctx, startMessage);
  });

bot.command('help', async (ctx) => {
    await sendReply(ctx, helpMessage);
  });

  bot.command('torrent', async (ctx) => {
    if (!ctx.message?.text) return;
    
    const magnetLink = ctx.message.text.substring('/torrent '.length).trim();
    
if (!magnetLink) {
      await sendReply(ctx, 'Usage: /torrent <magnet_link>');
      return;
    }
    
    if (!isMagnetLink(magnetLink)) {
      await sendReply(ctx, 'Please provide a valid magnet link starting with "magnet:"');
      return;
    }

    try {
      await sendReply(ctx, 'Processing magnet link...');
      const result = await addMagnetLink(magnetLink);
      await handleTorrentPostProcessing(result.id, ctx);
    } catch (error: any) {
      await sendReply(ctx, `❌ Error: ${error.message}`);
    }
  });

  bot.command('status', async (ctx) => {
    if (!ctx.message?.text) return;
    
    const torrentId = ctx.message.text.substring('/status '.length).trim();
    
if (!torrentId) {
      await sendReply(ctx, 'Usage: /status <torrent_id>');
      return;
    }

    try {
      await sendReply(ctx, 'Fetching torrent status...');
      const torrent = await getTorrentInfo(torrentId);
      const statusMessage = formatTorrentStatus(torrent);
      await sendReply(ctx, statusMessage);
    } catch (error: any) {
      await sendReply(ctx, `❌ Error: ${error.message}`);
    }
  });

  bot.command('download', async (ctx) => {
    if (!ctx.message?.text) return;
    
    const link = ctx.message.text.substring('/download '.length).trim();
    
if (!link) {
      await sendReply(ctx, 'Usage: /download <hoster_link>');
      return;
    }

    try {
      await sendReply(ctx, '🚀 Processing link...');
      const result = await unrestrictLink(link);
      const message = `🎉 Download ready!\n\n📁 \`${result.filename}\`\n\n*Size:* ${formatBytes(result.filesize)}\n\n[⬇️ Download](${result.download})`;
      await sendReply(ctx, message);
    } catch (error: any) {
      await sendReply(ctx, `❌ Error: ${error.message}`);
    }
  });

  bot.on('message:document', async (ctx) => { 
    const document = ctx.message.document;
    
if (document.mime_type !== "application/x-bittorrent") {
      await sendReply(ctx, `Expected torrent file, received: ${document.mime_type}`);
      return;
    }

    try {
      await sendReply(ctx, 'Processing torrent file...');
      const file = await ctx.api.getFile(document.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${env.BOT_TOKEN}/${file.file_path}`;
      
      const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
      const fileBuffer = Buffer.from(response.data);
      
      const result = await addTorrentFile(fileBuffer);
      await handleTorrentPostProcessing(result.id, ctx);
    } catch (error: any) {
      await sendReply(ctx, `❌ Error: ${error.message}`);
    }
  });
}

function sendReply(ctx: Context, message: string) {
  return ctx.reply(message, {
    parse_mode: 'Markdown',
    link_preview_options: { is_disabled: true }
  });
}