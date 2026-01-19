
import { createAdminClient } from "@/lib/supabase/admin";
import { GlobalNewsFeed } from "@/components/news/GlobalNewsFeed";
import { AiPromptInput } from "@/components/ui/AiPromptInput";

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Hourly cache (or 0 for real-time)

async function getNews() {
    try {
        const supabase = createAdminClient();
        const { data, error } = await supabase
            .from('public_news_feed')
            .select('*')
            .order('published_at', { ascending: false })
            .limit(50);

        if (error) throw error;
        return data || [];
    } catch (e) {
        console.error("Failed to fetch news:", e);
        return [
            {
                id: 'mock-1',
                title: 'Global Health News Feed Active',
                url: '#',
                source: 'System',
                published_at: new Date().toISOString(),
                ai_headline: 'System Online: Monitoring Global Health Feeds',
                ai_summary: 'The public news feed is active. Data is being served from the secure database or fallback system.',
                ai_why_this_matters: 'Ensures public access to health intelligence is always available.',
                ai_processed: true
            }
        ];
    }
}

export default async function GlobalHealthNewsPage() {
    const news = await getNews();

    return (
        <div className="h-full flex flex-col p-4 md:p-8 overflow-y-auto custom-scroll">
            <div className="max-w-7xl mx-auto w-full space-y-8 pb-12">

                {/* Intro */}
                <div className="max-w-3xl">
                    <h2 className="text-2xl font-light text-white mb-2">
                        Official Intelligence Feed
                    </h2>
                    <p className="text-slate-400">
                        Real-time updates from verified official sources (WHO, CDC, ECDC).
                        Curated for clarity and neutrality.
                    </p>
                </div>

                <GlobalNewsFeed news={news as any} />

                {/* AI Prompt Input */}
                <div className="pt-8">
                    <AiPromptInput placeholder="Ask about global health trends, outbreaks, or regions..." />
                </div>
            </div>
        </div>
    );
}
