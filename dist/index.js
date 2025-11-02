import { config } from 'dotenv';
import { Bot } from 'grammy';
import axios from 'axios';
config();
const bot = new Bot(process.env.BOT_TOKEN);
const RD_API_BASE = 'https://api.real-debrid.com/rest/1.0';
async function addMagnetLink(magnet) {
    try {
        const response = await axios.post(`${RD_API_BASE}/torrents/addMagnet`, {
            magnet,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.RD_API_TOKEN}`
            }
        });
        return response.data;
    }
    catch (error) {
        console.log({ error: error.response.data, magnet });
        throw new Error(`Failed to add magnet: ${error.response?.data?.error || error.message}`);
    }
}
async function addTorrentFile(torrentBuffer) {
    try {
        const url = `${RD_API_BASE}/torrents/addTorrent`;
        const response = await axios.put(url, torrentBuffer, {
            headers: {
                'Authorization': `Bearer ${process.env.RD_API_TOKEN}`,
                'Content-Type': 'application/x-bittorrent'
            },
        });
        return response.data;
    }
    catch (error) {
        throw new Error(`Failed to add torrent: ${error.response?.data?.error || error.message}`);
    }
}
function isMagnetLink(text) {
    return text.startsWith('magnet:');
}
bot.command('torrent', async (ctx) => {
    if (!ctx.message?.text)
        return;
    const args = ctx.message.text.split(' ').slice(1);
    if (args.length === 0) {
        await ctx.reply('Usage: /torrent <magnet_link>');
        return;
    }
    const magnetLink = args.join(' ');
    if (!isMagnetLink(magnetLink)) {
        await ctx.reply('Please provide a valid magnet link starting with "magnet:"');
        return;
    }
    try {
        await ctx.reply('Processing magnet link...');
        const result = await addMagnetLink(magnetLink);
        await ctx.reply(`✅ Torrent added successfully!\n\nID: ${result.id}\n`);
    }
    catch (error) {
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
    }
    catch (error) {
        await ctx.reply(`❌ Error: ${error.message}`);
    }
});
bot.start();
console.log('Bot started...');
