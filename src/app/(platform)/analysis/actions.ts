'use server';

import { createClient } from '@/lib/supabase/server';
import { generateText } from '@/lib/ai/gemini';
import { ANALYTICS_QA_PROMPT } from '@/lib/ai/prompts';
import { validateAiOutput, sanitizeResponse } from '@/lib/ai/safety';

/**
 * Server Action to explain analytics based on user query.
 * Enforces strict context limiting.
 */
export async function explainAnalytics(query: string, regionId?: string) {
    if (!query) return { success: false, message: "Query cannot be empty." };

    const supabase = await createClient();

    try {
        // 1. Fetch Constrained Context
        // LIMITATION: For MVP we hardcode fetching the Active Outbreak for the region (or default)
        // and its summary stats. We do NOT dump raw rows.

        let outbreakId: string | null = null;

        if (regionId) {
            const { data: outbreak } = await supabase
                .from('outbreaks')
                .select('id')
                .eq('region_id', regionId)
                .eq('status', 'monitoring') // assumption
                .single();
            if (outbreak) outbreakId = outbreak.id;
        } else {
            // Fallback to any active outbreak
            const { data: outbreak } = await supabase
                .from('outbreaks')
                .select('id')
                .eq('status', 'monitoring')
                .limit(1)
                .single();
            if (outbreak) outbreakId = outbreak.id;
        }

        if (!outbreakId) {
            return { success: false, message: "No active outbreak context found to analyze." };
        }

        // Fetch Summaries
        const [epiStats, signalStats] = await Promise.all([
            supabase.rpc('get_weekly_cases_summary', { outbreak_uuid: outbreakId }), // Assuming RPC or just fetch 7 days
            supabase.from('signal_metrics') // View
                .select('*')
                .eq('outbreak_id', outbreakId)
                .order('date', { ascending: false })
                .limit(7)
        ]);

        // Manual 7-day fetch if RPC missing (safe fallback)
        let casesContext = epiStats.data;
        if (!casesContext) {
            const { data: recentCases } = await supabase
                .from('case_timeseries')
                .select('date, active_cases, critical, recovered')
                .eq('outbreak_id', outbreakId)
                .order('date', { ascending: false })
                .limit(7);
            casesContext = recentCases;
        }

        const context = {
            query_scope: "Analytics Explanation",
            data_window: "Last 7 Days",
            epidemiology_summary: casesContext,
            signal_metrics: signalStats.data
        };

        // 2. Call Gemini
        const prompt = ANALYTICS_QA_PROMPT(query, context);
        const textResponse = await generateText(prompt, { temperature: 0.2 });

        // 3. Safety Check
        const safety = validateAiOutput(textResponse);
        if (!safety.valid) {
            return { success: false, message: safety.reason }; // Fail safe
        }

        return { success: true, message: sanitizeResponse(textResponse) };

    } catch (error) {
        console.error("Analytics Explanation Error:", error);
        return { success: false, message: "Failed to generate explanation. Please try again." };
    }
}
