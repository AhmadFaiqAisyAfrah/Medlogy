import { createClient } from '@/lib/supabase/server';
import { Database } from '@/lib/types';

type NewsSignalInsert = Database['public']['Tables']['news_signals']['Insert'];

/**
 * Saves news signals to the database with simple deduplication (by title).
 * This ensures idempotency for manual triggers.
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

        // Insert if not exists
        const { error } = await supabase
            .from('news_signals')
            .insert(signal);

        if (error) {
            console.error(`Failed to insert news signal: ${signal.title}`, error);
            // Continue best effort
        } else {
            insertedCount++;
        }
    }

    return { inserted: insertedCount, skipped: skippedCount };
}
