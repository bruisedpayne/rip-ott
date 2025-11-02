# Real Debrid Telegram Bot

Telegram bot that integrates with Real-Debrid API to get fast HTTPS links from torrents

## Features

- Add magnet links to your Real-Debrid account
- Upload .torrent files directly to the bot
- Check torrent status and progress
- Unrestrict hoster links for direct downloads
- Automatic file selection and download initiation

## Available Commands

### Bot Commands
- `/torrent <magnet_link>` - Add a magnet link to Real-Debrid and start download
- `/status <torrent_id>` - Check the status and progress of a torrent
- `/download <hoster_link>` - Unrestrict a hoster link for direct download

### File Upload
- Upload `.torrent` files directly to the bot to add them to Real-Debrid

## Usage Examples

1. **Add a magnet link:**
   ```
   /torrent magnet:?xt=urn:btih:example
   ```

2. **Check torrent status:**
   ```
   /status ABCDEFGHIJKLMNOPQRSTUVWXYZ
   ```

3. **Download from hoster:**
   ```
   /download https://example.com/file
   ```