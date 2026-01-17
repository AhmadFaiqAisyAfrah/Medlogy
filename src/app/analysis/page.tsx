
import { AnalysisView } from "@/components/dashboard/AnalysisView";
import { Activity, Map, FileText } from "lucide-react";
import scenarioData from '@/lib/data/outbreak_scenario.json';
import epiData from '@/lib/data/epidemiology.json';
import newsData from '@/lib/data/news.json';
import litData from '@/lib/data/literature.json';
import { NewsArticle, JournalArticle, EpiPoint } from '@/lib/types';

export default async function AnalysisPage() {
    const scenario = scenarioData;
    const epidemiology = epiData as EpiPoint[];
    const news = newsData as unknown as NewsArticle[];
    const literature = litData as JournalArticle[];

    const latestEpi = epidemiology[epidemiology.length - 1];
    const prevEpi = epidemiology[epidemiology.length - 2];
    const caseTrend = latestEpi && prevEpi ? Math.round(((latestEpi.cases - prevEpi.cases) / prevEpi.cases) * 100) : 0;

    return (
        <div className="pb-20">
            {/* Clinical Header - Simplified */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6 mb-8 px-2">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-sm bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono font-bold tracking-wider">
                            ACTIVE SURVEILLANCE
                        </span>
                        <span className="text-xs font-mono text-slate-500">ID: {scenario.scenarioId}</span>
                    </div>
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-3xl font-bold tracking-tight text-white">{scenario.description.split('.')[0]}</h1>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <span className="flex items-center gap-1.5"><Map size={14} /> {scenario.location}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="flex items-center gap-1.5"><Activity size={14} /> {scenario.pathogen.strain}</span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span className="font-mono text-xs opacity-70">Started {scenario.startDate}</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                        <FileText size={16} /> Export Report
                    </button>
                    <span className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-pulse flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                        {scenario.status.toUpperCase()}
                    </span>
                </div>
            </header>

            <AnalysisView
                scenario={scenario}
                epidemiology={epidemiology}
                news={news}
                literature={literature}
                caseTrend={caseTrend}
                latestEpi={latestEpi}
            />
        </div>
    );
}
