import db from '../../utils/db';
import 'dotenv/config'
export const prerender = false;

export async function GET({ url }: { url: URL }) {
  const site_id = url.searchParams.get('site_id');

  if (!site_id) {
    return new Response(JSON.stringify({ error: 'site_id is required' }), { status: 400 });
  }

  const stmt = db.prepare('SELECT * FROM site_updates WHERE site_id = ? ORDER BY timestamp DESC');
  const updates = stmt.all(site_id);

  return new Response(JSON.stringify(updates), { status: 200 });
}
