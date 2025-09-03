import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
    const result = await sql`SELECT code, answers FROM codes`;
    const codes = result.reduce((acc, row) => {
        acc[row.code] = { answers: JSON.parse(row.answers) };
        return acc;
    }, {});
    return new Response(JSON.stringify({ success: true, codes }), {
        headers: { 'Content-Type': 'application/json' },
    });
};
