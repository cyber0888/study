import { neon } from '@netlify/neon';

const sql = neon(process.env.NETLIFY_DATABASE_URL);

export default async (req, context) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    const { code } = await req.json();
    const result = await sql`SELECT answers FROM codes WHERE code = ${code}`;
    if (result.length > 0) {
        return new Response(JSON.stringify({ success: true, answers: JSON.parse(result[0].answers) }), {
            headers: { 'Content-Type': 'application/json' },
        });
    }
    return new Response(JSON.stringify({ success: false }), {
        headers: { 'Content-Type': 'application/json' },
    });
};

async function ensureTable() {
    await sql`
        CREATE TABLE IF NOT EXISTS codes (
            code TEXT PRIMARY KEY,
            answers JSONB NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS usage (
            id SERIAL PRIMARY KEY,
            code TEXT REFERENCES codes(code),
            user_name TEXT NOT NULL,
            correct INT NOT NULL,
            total INT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
    await sql`
        CREATE TABLE IF NOT EXISTS admin_keys (
            key TEXT PRIMARY KEY,
            is_owner BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;
}

ensureTable();
