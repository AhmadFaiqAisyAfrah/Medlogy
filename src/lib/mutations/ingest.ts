import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';
import { generateJSON } from '@/lib/ai/gemini';
import { NEWS_ENRICHMENT_PROMPT } from '@/lib/ai/prompts';
import { validateAiOutput, sanitizeResponse } from '@/lib/ai/safety';

type NewsSignalInsert = Database['public']['Tables']['news_signals']['Insert'];

/**
 * Saves news signals to the database with simple deduplication (by title).
 * Also ENRICHES news with Gemini and populates public_news_feed.
 */
export async function saveNewsSignals(signals: NewsSignalInsert[]): Promise<{ inserted: number; skipped: number }> {
    const supabase = await createClient();
    let insertedCount = 0;
    let skippedCount = 0;

    for (const signal of signals) {
        // Check existence
        const { data: existing } = await supabase
            .from('news_signals')
            .select('id')
            .eq('title', signal.title)
            .limit(1)
            .single();

        if (existing) {
            skippedCount++;
            continue;
        }

        // Insert into internal signal table
        const { data: insertedSignal, error: insertError } = await supabase
            .from('news_signals')
            .insert(signal)
            .select()
            .single();

        if (insertError) {
            console.error(`Failed to insert news signal: ${signal.title}`, insertError);
            continue;
        }

        insertedCount++;

        // ---------------------------------------------------------
        // GEMINI ENRICHMENT (Once per item, during ingestion)
        // ---------------------------------------------------------
        try {
            console.log(`Enriching news with Gemini: ${signal.title}`);
            const enrichmentPrompt = NEWS_ENRICHMENT_PROMPT(signal.title, signal.summary || "");
            const aiData = await generateJSON<{
                headline: string;
                summary: string;
                why_this_matters: string;
                sentiment: 'positive' | 'neutral' | 'negative' | 'serious';
            }>(enrichmentPrompt);

            // Safety Check
            const safetyCheck = validateAiOutput(aiData.summary + " " + aiData.why_this_matters);
            if (!safetyCheck.valid) {
                console.warn(`Gemini output blocked by safety: ${safetyCheck.reason}`);
                // Fallback to raw data if unsafe
                aiData.headline = signal.title;
                aiData.summary = signal.summary || "No summary available.";
                aiData.why_this_matters = "Review pending by content safety system.";
                aiData.sentiment = 'neutral';
            }

            // Insert into Public News Feed
            await supabase.from('public_news_feed').insert({
                title: signal.title, // Keep original title as secondary or primary
                url: '#', // TODO: signal needs URL
                source: signal.source as any,
                published_at: signal.published_at,
                original_snippet: signal.summary,

                // AI Fields
                ai_headline: sanitizeResponse(aiData.headline),
                ai_summary: sanitizeResponse(aiData.summary),
                ai_why_this_matters: sanitizeResponse(aiData.why_this_matters),
                ai_processed: true
            });

        } catch (aiError) {
            console.error(`Failed to enrich news item: ${signal.title}`, aiError);
            // Non-blocking failure for AI
        }
    }

    return { inserted: insertedCount, skipped: skippedCount };
}
