import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { code } = await req.json();
    const result = await sql`SELECT user_name, correct, total, date FROM usage WHERE code = ${code}`;
    const totalUsers = result.length;
    const totalCorrect = result.reduce((sum, row) => sum + row.correct, 0);
    const details = result.map(row => `<li>${row.user_name}: ${row.correct} / ${row.total} (${row.date})</li>`);

    return new Response(JSON.stringify({ success: true, totalUsers, totalCorrect, details }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
