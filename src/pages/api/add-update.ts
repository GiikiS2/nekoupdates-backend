import db, { downloadDatabase, savetonekoweb } from '../../utils/db';
import 'dotenv/config';
import { isValidToken } from './register';

export const prerender = false;

export async function POST({ request }: { request: Request }) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (await !isValidToken(token)) {
        return new Response(JSON.stringify({ error: 'Token inválido' }), { status: 403 });
    }

    const body = await request.json();
    console.log("Incoming request body:", body);
    const { site_url, date, update_details } = body;

    if (!site_url || !update_details) {
        return new Response(JSON.stringify({ error: 'site_id and update_details are required' }), { status: 400 });
    }

    try {
        await downloadDatabase();
    } catch (error) {
        console.error("Error downloading the database:", error);
        return new Response(JSON.stringify({ error: 'Failed to download database' }), { status: 500 });
    }

    const stmt = db.prepare(`
        INSERT INTO site_updates (site_id, timestamp, update_details)
        VALUES (?, ?, ?)
    `);
    stmt.run(site_url, date, update_details || null);

    await savetonekoweb()

    return new Response(JSON.stringify({ message: 'Update added successfully' }), { status: 201 });
}
