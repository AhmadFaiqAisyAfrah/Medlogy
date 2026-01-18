import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

export type InsightSummaryRecord = Pick<
    Database['public']['Tables']['insight_summaries']['Row'],
    'summary_points' | 'confidence_level' | 'generated_at'
>;

/**
 * Fetches the latest AI-generated insight summary.
 */
export async function getInsightSummary(outbreakId: string): Promise<InsightSummaryRecord | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('insight_summaries')
        .select('summary_points, confidence_level, generated_at')
        .eq('outbreak_id', outbreakId)
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        console.error(`Warning: Failed to fetch insight summary for ${outbreakId}`, error);
        return null; // Graceful degradation for insights
    }

    return data;
}
