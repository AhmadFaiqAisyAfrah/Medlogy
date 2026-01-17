"use client";

import { useState } from "react";
import { BentoGrid, BentoItem } from "@/components/dashboard/BentoGrid";
import { StatCard } from "@/components/dashboard/StatCard";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { CorrelationChart } from "@/components/dashboard/charts/CorrelationChart";
import { IntelFeed } from "@/components/dashboard/feeds/IntelFeed";
import { InsightSummary } from "@/components/dashboard/InsightSummary";
import { DataLayerToggle, DataLayer } from "@/components/dashboard/DataLayerToggle";
import { Activity, Users, AlertTriangle, TrendingUp, Map, FileText } from "lucide-react";
import * as motion from "framer-motion/client";
import { NewsArticle, JournalArticle, EpiPoint, OutbreakScenario } from '@/lib/types';
import { cn } from "@/lib/utils";

interface AnalysisViewProps {
    scenario: OutbreakScenario;
    epidemiology: EpiPoint[];
    news: NewsArticle[];
    literature: JournalArticle[];
    caseTrend: number;
    latestEpi: EpiPoint | undefined;
}

export function AnalysisView({ scenario, epidemiology, news, literature, caseTrend, latestEpi }: AnalysisViewProps) {
    const [layer, setLayer] = useState<DataLayer>('analytical');

    // MOCK Generated Insights (In prod, this would come from LLM)
    const insights = [
        { text: "ILI cases increased 11% over the last 7 days, signaling accelerated spread.", type: 'negative' },
        { text: "Highest concentration detected in South Jakarta, correlating with rapid urban transit.", type: 'neutral' },
        { text: "News volume spike precedes local case reporting by ~48 hours.", type: 'positive' }
    ] as const;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6 pb-20 px-2"
        >
            {/* Insight Summary - Always Visible */}
            <InsightSummary points={insights as any} riskLevel="Medium" />

            {/* Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <DataLayerToggle activeLayer={layer} onChange={setLayer} />
                <div className="text-xs text-slate-500 text-right hidden sm:block">
                    Last Index Update: <span className="text-slate-400 font-mono">14m ago</span>
                </div>
            </div>

            <BentoGrid className="gap-6">
                {/* Stats Row */}
                <BentoItem colSpan={1}>
                    <StatCard
                        label="Active Cases"
                        value={latestEpi?.cases.toLocaleString() || "0"}
                        icon={Activity}
                        trend={{ value: caseTrend, isPositive: caseTrend > 0 }}
                        className={cn("bg-slate-950/40 border-white/10", layer === 'summary' && "opacity-80 grayscale-[0.3]")}
                        minimal={layer === 'summary'}
                    />
                </BentoItem>
                <BentoItem colSpan={1}>
                    <StatCard
                        label="Recovered"
                        value={latestEpi?.recovered.toLocaleString() || "0"}
                        icon={TrendingUp}
                        trend={{ value: 5, isPositive: true }}
                        className={cn("bg-slate-950/40 border-white/10", layer === 'summary' && "opacity-80 grayscale-[0.3]")}
                        minimal={layer === 'summary'}
                    />
                </BentoItem>
                <BentoItem colSpan={1}>
                    <StatCard
                        label="Critical Alerts"
                        value={news.filter(n => n.sentiment === 'negative').length}
                        icon={AlertTriangle}
                        className={cn("bg-red-950/10 border-red-500/20", layer === 'summary' && "opacity-80 grayscale-[0.3]")}
                        minimal={layer === 'summary'}
                    />
                </BentoItem>
                <BentoItem colSpan={1}>
                    <StatCard
                        label="Monitoring Units"
                        value="142"
                        icon={Users}
                        className={cn("bg-slate-950/40 border-white/10", layer === 'summary' && "opacity-80 grayscale-[0.3]")}
                        minimal={layer === 'summary'}
                    />
                </BentoItem>

                {/* Main Chart */}
                <BentoItem colSpan={2} rowSpan={2} className="min-h-[400px]">
                    <GlassPanel className="h-full flex flex-col bg-slate-950/30 border-white/10" noBorder>
                        <div className="flex items-center justify-between mb-6 px-1">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-primary" />
                                Correlation Analysis
                            </h3>
                            {layer !== 'summary' && (
                                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" /> Cases</div>
                                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-yellow-500" /> News Events</div>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 w-full relative">
                            {/* In a real implementation pass 'layer' to chart to adjust detail level */}
                            <CorrelationChart data={epidemiology} newsEvents={news} />

                            {/* Overlay for Summary Mode */}
                            {layer === 'summary' && (
                                <div className="absolute top-4 left-4 bg-slate-900/90 border border-white/10 p-3 rounded-lg max-w-xs pointer-events-none backdrop-blur-md">
                                    <p className="text-xs text-slate-300 leading-relaxed">
                                        <strong className="text-primary">Summary:</strong> Case growth tracks closely with negative news events with a 2-day lag.
                                    </p>
                                </div>
                            )}

                            {/* Overlay for Research Mode */}
                            {layer === 'research' && (
                                <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-white/10 p-2 rounded text-[10px] text-slate-400 font-mono">
                                    Model: SIR-V | Confidence: 87% | Source: MOH + Firecrawl
                                </div>
                            )}
                        </div>
                    </GlassPanel>
                </BentoItem>

                {/* Intel Feed */}
                <BentoItem colSpan={1} rowSpan={2} className="md:col-span-2 lg:col-span-1 min-h-[400px]">
                    <GlassPanel className="h-full flex flex-col overflow-hidden bg-slate-950/30 border-white/10" noBorder>
                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Activity size={18} className="text-emerald-400" />
                                Intel Feed
                            </h3>
                            {layer === 'research' && (
                                <span className="text-[10px] font-mono text-slate-500">LIVE | WEBSOCKET_ACTIVE</span>
                            )}
                        </div>
                        <IntelFeed news={news} literature={literature} layer={layer} />
                    </GlassPanel>
                </BentoItem>

                {/* Geospatial */}
                <BentoItem colSpan={1} rowSpan={2} className="min-h-[400px] hidden xl:block">
                    <GlassPanel className="h-full flex flex-col relative overflow-hidden bg-slate-950/30 border-white/10 group" noBorder>
                        <div className="absolute inset-0 bg-[#0f1729] z-0 opacity-50 transition-opacity duration-700 group-hover:opacity-40" />

                        {/* Hints */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none z-20 opacity-100 group-hover:opacity-0 transition-opacity duration-500">
                            <div className="mb-3 mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center bg-white/5 animate-pulse-slow">
                                <Map className="text-indigo-400 opacity-60" />
                            </div>
                            <p className="text-sm font-medium text-slate-400">Hover to explore regional patterns</p>
                        </div>

                        {/* Grid Pattern */}
                        <div className="absolute inset-0 opacity-10"
                            style={{
                                backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                                backgroundSize: '32px 32px'
                            }}
                        />

                        <div className="relative z-10 flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Map size={18} className="text-indigo-400" />
                                Geospatial
                            </h3>
                            {layer === 'research' && (
                                <span className="text-[10px] font-mono text-indigo-400 border border-indigo-500/20 px-1 rounded">
                                    RES: 10km
                                </span>
                            )}
                        </div>

                        {/* Map Area */}
                        <div className="flex-1 w-full pl-6 pt-6 opacity-40 group-hover:opacity-100 transition-opacity duration-500">
                            {/* Abstract Map visual for MVP */}
                            <div className="w-full h-full border-l border-t border-indigo-500/20 rounded-tl-3xl relative">
                                <div className="absolute top-4 left-4 w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse" />
                                <div className="absolute top-12 left-20 w-2 h-2 bg-indigo-500/50 rounded-full" />
                                <div className="absolute top-32 left-10 w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.4)] animate-pulse" />
                            </div>
                        </div>
                    </GlassPanel>
                </BentoItem>

            </BentoGrid>
        </motion.div>
    );
}
