import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { code, user, correct, total } = await req.json();
    await sql`INSERT INTO usage (code, user_name, correct, total) VALUES (${code}, ${user}, ${correct}, ${total})`;
    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
