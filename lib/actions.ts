'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export async function saveDecision(dilemma: string, outcome: 'app' | 'folded' | 'executed', category?: string) {
  // 'app' is not a valid outcome, assuming 'folded' or 'executed'
  // If 'outcome' is passed from the UI, ensure it matches DB constraint

  if (outcome !== 'folded' && outcome !== 'executed') {
    throw new Error('Invalid outcome');
  }

  try {
    await sql`
      INSERT INTO decisions (dilemma, outcome, meta)
      VALUES (${dilemma}, ${outcome}, ${category ? sql.json({ category }) : null})
    `;

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to save decision:', error);
    return { success: false, error };
  }
}

export async function getWinRate() {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE outcome = 'executed') as wins,
        COUNT(*) as total
      FROM decisions
    `;

    const wins = Number(result[0].wins);
    const total = Number(result[0].total);

    if (total === 0) return 0;
    return Math.round((wins / total) * 100);
  } catch (error) {
    console.error('Database Error in getWinRate:', error);
    // Fallback to 0 to prevent app crash
    return 0;
  }
}

export async function getHistory() {
  try {
    const history = await sql`
      SELECT id, dilemma, outcome, created_at, meta
      FROM decisions
      ORDER BY created_at DESC
      LIMIT 100
    `;
    return history;
  } catch (error) {
    console.error('Database Error in getHistory:', error);
    return [];
  }
}
