import { isValidToken } from "./register";
import db, { downloadDatabase, savetonekoweb } from '../../utils/db'; // Import your DB module

export const prerender = false;

export async function POST({ request }: { request: Request }) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (await !isValidToken(token)) {
        return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 403 });
    }

    const body = await request.json();
    console.log("Incoming request body:", body);
    const { site_url, updates } = body;

    if (!site_url || !Array.isArray(updates) || updates.length === 0) {
      return new Response(JSON.stringify({ message: 'Invalid request format' }), { status: 400 });
    }

    try {
      await downloadDatabase();
  } catch (error) {
      console.error("Error downloading the database:", error);
      return new Response(JSON.stringify({ error: 'Failed to download database' }), { status: 500 });
  }

    let addedUpdates = 0;

    for (let update of updates) {
        const { date, description } = update;

        const checkStmt = db.prepare(`
          SELECT 1 FROM site_updates WHERE site_id = ? AND update_details = ?
      `);
      const exists = checkStmt.get(site_url, description);
      // console.log(exists)
      // console.log(site_url, description)
      if (!exists) {
          const stmt = db.prepare(`
              INSERT INTO site_updates (site_id, timestamp, update_details)
              VALUES (?, ?, ?)
          `);
          stmt.run(site_url, date, description);
          addedUpdates++;
      }
    }
    await savetonekoweb()

    return new Response(JSON.stringify({
        message: `${addedUpdates} updates were added successfully.`,
        totalUpdates: updates.length,
        missingUpdates: addedUpdates
    }), { status: 200 });
}
