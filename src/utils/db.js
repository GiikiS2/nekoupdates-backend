import Database from 'better-sqlite3';

import fs from 'fs';
import axios from 'axios';

const remoteDbUrl = 'https://giikis2.nekoweb.org/site_updates.db';
const localDbPath = 'site_updates.db';

export async function downloadDatabase() {
    try {
        const response = await axios({
            method: 'get',
            url: remoteDbUrl,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(localDbPath);
        response.data.pipe(writer);

        return new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
    } catch (error) {
        console.error('Error downloading database:', error);
        throw error;
    }
}

const db = new Database('site_updates.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS site_updates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    site_id TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_details TEXT NOT NULL,
    version TEXT,
    author TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS valid_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token TEXT NOT NULL UNIQUE,
    client_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);
export async function savetonekoweb(){
  
  const filePath = 'site_updates.db';
  if (!fs.existsSync(filePath)) {
      return new Response(JSON.stringify({ error: 'Database file not found' }), { status: 400 });
  }

  const form = new FormData();
  const stream = fs.createReadStream(filePath);

  form.append('files', stream);
  form.append('pathname', './'); 

  try {
      const response = await axios.post('https://nekoweb.org/api/files/upload', form, {
          headers: {
              ...form.getHeaders(),
              'Authorization': process.env.API_KEY, 
          }
      });
      console.log('File uploaded successfully:', response.data);
  } catch (error) {
      console.error('Error uploading file:', error.response?.data || error.message);
      return new Response(JSON.stringify({ error: 'Failed to upload database' }), { status: 500 });
  }
}
export default db;
