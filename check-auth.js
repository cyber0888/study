import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { code } = await req.json();
    const result = await sql`SELECT is_owner FROM admin_keys WHERE key = ${code}`;
    if (result.length > 0) {
        return new Response(JSON.stringify({ success: true, isOwner: result[0].is_owner }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
    return new Response(JSON.stringify({ success: false }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
