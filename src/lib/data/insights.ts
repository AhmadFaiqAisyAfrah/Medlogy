import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';
import { generateText } from '@/lib/ai/gemini';
import { INSIGHT_EXPLANATION_PROMPT } from '@/lib/ai/prompts';
import { validateAiOutput } from '@/lib/ai/safety';

export type InsightSummaryRecord = Pick<
    Database['public']['Tables']['insight_summaries']['Row'],
    'summary_points' | 'confidence_level' | 'generated_at'
>;

/**
 * Fetches the latest AI-generated insight summary.
 * If no recent summary exists (older than 24h), it generates a new one.
 */
export async function getInsightSummary(outbreakId: string): Promise<InsightSummaryRecord | null> {
    const supabase = await createClient();

    // 1. Try to get recent summary
    const { data: existing } = await supabase
        .from('insight_summaries')
        .select('summary_points, confidence_level, generated_at')
        .eq('outbreak_id', outbreakId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

    // Check if stale (older than 24h) or missing
    const isStale = !existing || (Date.now() - new Date(existing.generated_at).getTime() > 24 * 60 * 60 * 1000);

    if (!isStale && existing) {
        return existing;
    }

    // 2. Generate New Insight if stale
    console.log(`Generating new insight for ${outbreakId}...`);
    try {
        // Fetch context data (Rule Engine Inputs)
        // For MVP we fetch a small summary of cases and signals
        const [timeseriesRes, signalsRes] = await Promise.all([
            supabase.from('case_timeseries')
                .select('date, active_cases, critical')
                .eq('outbreak_id', outbreakId)
                .order('date', { ascending: false })
                .limit(7),
            supabase.from('news_signals')
                .select('title, signal_level')
                .eq('outbreak_id', outbreakId)
                .order('published_at', { ascending: false })
                .limit(5)
        ]);

        const context = {
            recent_cases: timeseriesRes.data || [],
            recent_signals: signalsRes.data || []
        };

        const prompt = INSIGHT_EXPLANATION_PROMPT(context);
        const rawText = await generateText(prompt, { temperature: 0.2 });

        // Parse bullets (assuming AI returns text with newlines or bullets)
        const summaryPoints = rawText
            .split('\n')
            .map(line => line.replace(/^-\s*/, '').replace(/^\*\s*/, '').trim())
            .filter(line => line.length > 10);

        // Safety Filter
        const validPoints = summaryPoints.filter(p => validateAiOutput(p).valid);

        if (validPoints.length === 0) {
            throw new Error("No safe insight points generated.");
        }

        // Save to DB
        const { data: newRecord, error: insertError } = await supabase
            .from('insight_summaries')
            .insert({
                outbreak_id: outbreakId,
                summary_points: validPoints,
                confidence_level: 0.9,
                generated_at: new Date().toISOString()
            })
            .select('summary_points, confidence_level, generated_at')
            .single();

        if (insertError) throw insertError;

        return newRecord;

    } catch (e) {
        console.error("Failed to generate insights:", e);
        // Fallback to existing if available
        return existing || null;
    }
}
