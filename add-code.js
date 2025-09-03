import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { code, answers } = await req.json();
    try {
        await sql`INSERT INTO codes (code, answers) VALUES (${code}, ${JSON.stringify(answers)}) ON CONFLICT (code) DO NOTHING`;
        return new Response(JSON.stringify({ success: true }), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            headers: { 'Content-Type': 'application/json' },
            status: 500,
        });
    }
};
