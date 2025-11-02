import { GITHUB_URL } from "../config.js";

export const helpMessage = `📖 *RIP OTT Help*

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

Need help? Use \`/help\` anytime!

[View Source](${GITHUB_URL})`;