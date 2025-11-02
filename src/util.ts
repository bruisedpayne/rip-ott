export function isMagnetLink(text: string): boolean {
  return text.startsWith('magnet:');
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDate(jsonDate: string): string {
  return new Date(jsonDate).toLocaleString();
}

export function formatTorrentStatus(torrent: any): string {
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