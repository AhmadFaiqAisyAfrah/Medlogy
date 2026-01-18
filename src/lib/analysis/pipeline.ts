import { getActiveOutbreak, getOutbreakTimeseries, getNewsSignals, getResearchSources } from "@/lib/data";
import { generateInsightBullets } from "./engine";
import { saveInsightSummary } from "@/lib/mutations/insights";

/**
 * Orchestrates the full Insight Automation flow.
 * 1. Fetches Read-Only Data
 * 2. Generates Deterministic Insights
 * 3. Persists to Database
 */
export async function runAnalysisPipeline(outbreakId?: string) {
    console.log("Starting Analysis Pipeline...");

    // 1. Scope: Get target outbreak
    let targetId = outbreakId;
    let outbreak = null;

    if (targetId) {
        // Fetch specific (implemented in data layer but we need to import it if used, 
        // currently we strictly use getActiveOutbreak for MVP single-tenant feel, 
        // but let's stick to getActiveOutbreak as the entry point if no ID provided)
        // For MVP, likely we just want the active one.
        const active = await getActiveOutbreak();
        if (active && active.id === targetId) {
            outbreak = active;
        } else {
            // If explicit ID requested but not active, we might need getOutbreakById from data layer
            // reusing getActiveOutbreak for now as primary MVP use case
            outbreak = active;
        }
    } else {
        outbreak = await getActiveOutbreak();
        targetId = outbreak?.id;
    }

    if (!outbreak || !targetId) {
        throw new Error("No active outbreak found to analyze.");
    }

    console.log(`Analyzing Scenerio: ${outbreak.title} (${targetId})`);

    // 2. Fetch Context Data (Parallel)
    const [timeseries, news, research] = await Promise.all([
        getOutbreakTimeseries(targetId),
        getNewsSignals(targetId),
        getResearchSources(targetId)
    ]);

    // 3. Generate Insights
    const insight = generateInsightBullets(outbreak, timeseries, news, research);
    console.log("Generated Insights:", insight);

    // 4. Persist
    await saveInsightSummary(targetId, insight);
    console.log("Insights successfully persisted to database.");

    return insight;
}
