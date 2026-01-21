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
            `- [${h.meta?.category || 'General'}] Date: ${new Date(h.created_at).toLocaleDateString()}, Dilemma: "${h.dilemma}", Result: ${h.outcome.toUpperCase()}`
        ).join('\n');

        // 3. Generate Analysis
        const { text } = await generateText({
            model: google('gemini-3-flash-preview'),
            system: "You are The Oracle, a ruthless system analyst. Your job is to predict the user's future based on their recent decision history. Be direct, brutal, and analytical.",
            prompt: `
            USER CONTEXT:
            - **PHYSICAL**: Health, Sleep, Diet (Goal: High Energy for Engineering).
            - **CAREER**: Google Internship '26, Backend Mastery, LeetCode (Goal: Principal Engineer).
            - **TALENT**: Guitar, Skill Acquisition (Goal: Mastery).
            - **SOCIAL**: Relationships, Family (Goal: High Value Connection).

            Analyze this decision history:
            ${historyText}

            Based on these patterns, write a 'Trajectory Report'.
            
            Structure your response exactly like this:
            
            ## 1. EXECUTIVE SUMMARY
            (One brutal sentence summarizing their current path).

            ## 2. SECTOR ANALYSIS
            **PHYSICAL**: [Projection based on Physical decisions]
            **CAREER**: [Projection based on Career decisions - Will he keep the internship?]
            **TALENT**: [Projection based on Talent decisions]
            **SOCIAL**: [Projection based on Social decisions]

            ## 3. THE FIX
            (The single most critical adjustment needed immediately).
            `,
        });

        return Response.json({ analysis: text });

    } catch (error) {
        console.error('Analysis API Error:', error);
        return Response.json({ error: 'Failed to generate analysis' }, { status: 500 });
    }
}
