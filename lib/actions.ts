'use server';

import postgres from 'postgres';
import { revalidatePath } from 'next/cache';

const sql = postgres(process.env.DATABASE_URL!, { ssl: 'require' });

export async function saveDecision(dilemma: string, outcome: 'app' | 'folded' | 'executed') {
  // 'app' is not a valid outcome, assuming 'folded' or 'executed'
  // If 'outcome' is passed from the UI, ensure it matches DB constraint

  if (outcome !== 'folded' && outcome !== 'executed') {
    throw new Error('Invalid outcome');
  }

  await sql`
    INSERT INTO decisions (dilemma, outcome)
    VALUES (${dilemma}, ${outcome})
  `;

  revalidatePath('/');
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
