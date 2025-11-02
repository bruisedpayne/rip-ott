import axios from 'axios';

const RD_API_BASE = 'https://api.real-debrid.com/rest/1.0';

export async function addMagnetLink(magnet: string) {
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

export async function addTorrentFile(torrentBuffer: Buffer) {
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

export async function unrestrictLink(link: string) {
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

export async function getTorrentInfo(torrentId: string) {
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

export async function selectFiles(torrentId: string) {
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