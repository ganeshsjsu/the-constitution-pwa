require('dotenv').config({ path: '.env.local' });
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' });

async function init() {
    console.log('Initializing database...');

    await sql`
    CREATE TABLE IF NOT EXISTS decisions (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      dilemma TEXT NOT NULL,
      outcome TEXT NOT NULL CHECK (outcome IN ('folded', 'executed')),
      meta JSONB
    );
  `;

    console.log('Table "decisions" created or already exists.');
    process.exit(0);
}

init().catch((err) => {
    console.error(err);
    process.exit(1);
});
