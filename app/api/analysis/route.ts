import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getHistory } from '@/lib/actions';

export const maxDuration = 30; // Allow longer timeout for analysis

export async function POST(req: Request) {
    try {
        // 1. Fetch History
        const history = await getHistory();

        if (history.length < 5) {
            return Response.json({
                analysis: "Insufficient data. Complete at least 5 Spars to unlock trajectory analysis."
            });
        }

        // 2. Format for AI
        const historyText = history.map(h =>
            `- Date: ${new Date(h.created_at).toLocaleDateString()}, Dilemma: "${h.dilemma}", Result: ${h.outcome.toUpperCase()}`
        ).join('\n');

        // 3. Generate Analysis
        const { text } = await generateText({
            model: google('gemini-2.0-flash'),
            system: "You are The Oracle, a ruthless system analyst. Your job is to predict the user's future based on their recent decision history. Be direct, brutal, and analytical.",
            prompt: `
            Analyze this decision history:
            ${historyText}

            Based on these patterns, write a 'Trajectory Report' for 1 year from now.
            
            Structure:
            1. THE PATTERN: Identify the core weakness (e.g., "You consistently fold under evening fatigue").
            2. THE PROJECTION: Describe their life in 1 year if they don't change. Be specific and visceral.
            3. THE FIX: One singular, high-leverage change they must make.
            
            Keep it under 200 words. No fluff.
            `,
        });

        return Response.json({ analysis: text });

    } catch (error) {
        console.error('Analysis API Error:', error);
        return Response.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }
}
