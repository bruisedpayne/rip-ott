import { config } from 'dotenv';
import { Bot } from 'grammy';
import axios from 'axios';

config();

const bot = new Bot(process.env.BOT_TOKEN!);
const RD_API_BASE = 'https://api.real-debrid.com/rest/1.0';

async function addMagnetLink(magnet: string) {
  try {
    const formData = new FormData();
    formData.append('magnet', magnet);
    
    const response = await axios.post(`${RD_API_BASE}/torrents/addMagnet`, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.RD_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error: any) {
    console.log({ error: error.response.data, magnet })
    throw new Error(`Failed to add magnet: ${error.response?.data?.error || error.message}`);
  }
}

async function addTorrentFile(torrentBuffer: Buffer) {
  try {
    const url = `${RD_API_BASE}/torrents/addTorrent`;
    const response = await axios.put(url, torrentBuffer, {
      headers: {
        'Authorization': `Bearer ${process.env.RD_API_TOKEN}`,
        'Content-Type': 'application/x-bittorrent'
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to add torrent: ${error.response?.data?.error || error.message}`);
  }
}

async function unrestrictLink(link: string) {
  try {
    const formData = new FormData();
    formData.append('link', link);
    
    const response = await axios.post(`${RD_API_BASE}/unrestrict/link`, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.RD_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to unrestrict link: ${error.response?.data?.error || error.message}`);
  }
}

function isMagnetLink(text: string): boolean {
  return text.startsWith('magnet:');
}

async function getTorrentInfo(torrentId: string) {
  try {
    const response = await axios.get(`${RD_API_BASE}/torrents/info/${torrentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.RD_API_TOKEN}`
      }
    });
     console.log("torrent info", response.data)
    return response.data
  } catch (error: any) {
    throw new Error(`Failed to get torrent info: ${error.response?.data?.error || error.message}`);
  }
}

async function selectFiles(torrentId: string) {
  try {
    const formData = new FormData();
    formData.append('files', 'all');
    
    await axios.post(`${RD_API_BASE}/torrents/selectFiles/${torrentId}`, formData, {
      headers: {
        'Authorization': `Bearer ${process.env.RD_API_TOKEN}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
  } catch (error: any) {
    console.log(error.response.data)
    throw new Error(`Failed to select files: ${error.response?.data?.error || error.message}`);
  }
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(jsonDate: string): string {
  return new Date(jsonDate).toLocaleString();
}


function formatTorrentStatus(torrent: any): string {
  let message = `*ID:* ${torrent.id}\n\n`;
  message += `*Filename:* ${torrent.filename}\n\n`;
  message += `*Size:* ${formatBytes(torrent.original_bytes)}\n\n`;
  message += `*Status:* ${torrent.status.replaceAll("_", " ")}\n\n`;
  message += `*Progress:* ${torrent.progress}%\n\n`;
  message += `*Added:* ${formatDate(torrent.added)}\n\n`;
  
  if (torrent.links && torrent.links.length > 0) {
    message += `*Links:*\n`;
    torrent.links.forEach((link: string) => {
      message += `• ${link}\n`;
    });
  }
  
  return message.trim();
}

bot.command('torrent', async (ctx) => {
  if (!ctx.message?.text) return;
  
  // Extract everything after "/torrent " as the magnet link
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
    await ctx.reply(`✅ Torrent added successfully!\n\nID: ${result.id}\n`);
    
    await ctx.reply('Selecting all files to start download...');
    await selectFiles(result.id);
    await ctx.reply('✅ All files selected! Download started.');
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});

bot.command('status', async (ctx) => {
  if (!ctx.message?.text) return;
  
  // Extract everything after "/status " as the torrent ID
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
  
  // Extract everything after "/download " as the link
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
    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;
   
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const fileBuffer = Buffer.from(response.data);
   
    const result = await addTorrentFile(fileBuffer);
    await ctx.reply(`✅ Torrent added successfully!\n\nID: ${result.id}\n`);
    
    await ctx.reply('Selecting all files to start download...');
    await selectFiles(result.id);
    await ctx.reply('✅ All files selected! Download started.');
  } catch (error: any) {
    await ctx.reply(`❌ Error: ${error.message}`);
  }
});


bot.start();
console.log('Bot started...');