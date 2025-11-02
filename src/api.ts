import axios from 'axios';
import { env } from './env.js';

const RD_API_BASE = 'https://api.real-debrid.com/rest/1.0';

const rdApi = axios.create({
  baseURL: RD_API_BASE,
  headers: {
    'Authorization': `Bearer ${env.RD_API_TOKEN}`
  }
});

rdApi.interceptors.response.use(
  response => response,
  error => {
    console.log({ error: error.response?.data });
    throw new Error(`API Error: ${error.response?.data?.error || error.message}`);
  }
);

export async function addMagnetLink(magnet: string) {
  const formData = new FormData();
  formData.append('magnet', magnet);
  
  const response = await rdApi.post('/torrents/addMagnet', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
}

export async function addTorrentFile(torrentBuffer: Buffer) {
  const response = await rdApi.put('/torrents/addTorrent', torrentBuffer, {
    headers: {
      'Content-Type': 'application/x-bittorrent'
    },
  });
  return response.data;
}

export async function unrestrictLink(link: string) {
  const formData = new FormData();
  formData.append('link', link);
  
  const response = await rdApi.post('/unrestrict/link', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return response.data;
}

export async function getTorrentInfo(torrentId: string) {
  const response = await rdApi.get(`/torrents/info/${torrentId}`);
  console.log("torrent info", response.data)
  return response.data
}

export async function selectFiles(torrentId: string) {
  const formData = new FormData();
  formData.append('files', 'all');
  
  await rdApi.post(`/torrents/selectFiles/${torrentId}`, formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
}