import { randomBytes } from 'crypto';
import db from '../../utils/db'; // Ensure this points to your SQLite database connection
import 'dotenv/config';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
  const body = await request.json();

  if (!body.clientId) {
    return new Response(JSON.stringify({ error: 'Client ID not provided' }), { status: 400 });
  }

  const token = randomBytes(32).toString('hex');

  try {
    const stmt = db.prepare(`
      INSERT INTO valid_tokens (token, client_id) 
      VALUES (?, ?)
    `);
    stmt.run(token, body.clientId);

    return new Response(JSON.stringify({ token }), { status: 201 });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ error: 'Failed to store token' }), { status: 500 });
  }
}

export async function isValidToken(token: string): Promise<boolean> {
    const stmt = db.prepare('SELECT 1 FROM valid_tokens WHERE token = ? LIMIT 1');
    const result = stmt.get(token);
  
    return !!result;
  }
  
