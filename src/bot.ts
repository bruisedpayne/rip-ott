import { Bot } from 'grammy';
import axios from 'axios';
import { addMagnetLink, addTorrentFile, unrestrictLink, getTorrentInfo, selectFiles } from './api.js';
import { isMagnetLink, formatTorrentStatus, formatBytes } from './util.js';
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

  bot.command('start', async (ctx) => {
    const welcomeMessage = `🎉 *Welcome to RIP OTT!*

I help you download torrents and get fast HTTPS download links.

*Quick Start:*
1. Upload a torrent file or use \`/torrent <magnet_link>\`
2. Check download status with \`/status <torrent_id>\`
3. Get download links with \`/download <link>\`

Use \`/help\` for detailed instructions.`;

    await ctx.reply(welcomeMessage, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
  });

  bot.command('help', async (ctx) => {
    const helpMessage = `📖 *RIP OTT Help*

*How to use this bot:*

🔹 **Step 1: Add a torrent**
• Upload a torrent file directly
• Or use: \`/torrent <magnet_link>\`
• Example: \`/torrent magnet:?xt=urn:btih:...\`

🔹 **Step 2: Check download status**
• Use: \`/status <torrent_id>\`
• Example: \`/status 123456789\`
• Status shows: downloading, completed, etc.

🔹 **Step 3: Download files**
• Once status shows "downloaded"
• You'll get individual file links
• Use: \`/download <file_link>\`
• Get fast HTTPS download links

*Available Commands:*
• \`/start\` - Welcome message
• \`/help\` - Show this help
• \`/torrent <magnet>\` - Add magnet link
• \`/status <id>\` - Check torrent status
• \`/download <link>\` - Get download link

*Tips:*
• Torrent files must be \`.torrent\` format
• Magnet links must start with "magnet:"
• Download links expire after some time
• Large files may take time to process

Need help? Use \`/help\` anytime!`;

    await ctx.reply(helpMessage, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true } });
  });

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
      const message = `🎉 Download ready!\n\n*Size:* ${formatBytes(result.filesize)}\n\n[${result.filename}](${result.download})`;
      await ctx.reply(message, { parse_mode: 'Markdown', link_preview_options: { is_disabled: true} });
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