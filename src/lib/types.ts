export type OutbreakScenario = Scenario;

export interface Scenario {
    scenarioId: string;
    name: string;
    startDate: string;
    location: string;
    pathogen: {
        name: string;
        strain: string;
        type: string;
        r0_initial: number;
        r0_current: number;
    };
    status: string;
    description: string;
    phases: { day: number; name: string; description: string }[];
}

export interface EpiPoint {
    date: string;
    cases: number;
    deaths: number;
    recovered: number;
    hospitalized: number;
    positivity_rate: number;
}

export interface NewsArticle {
    id: string;
    date: string;
    source: string;
    title: string;
    summary: string;
    sentiment: 'positive' | 'neutral' | 'negative' | 'serious';
    relevance_score: number;
}

export interface JournalArticle {
    id: string;
    title: string;
    journal: string;
    authors: string[];
    date: string;
    type: string;
    abstract: string;
    key_findings: string[];
    url: string;
}

export interface IntelligenceReport {
    generatedAt: string;
    headline: string;
    summary: string;
    riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
    keyInsights: string[];
}
