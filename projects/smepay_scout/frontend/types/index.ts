export interface ExecutiveBriefing {
  market_health: string;
  top_risk: string;
  top_opportunity: string;
  recommended_focus: string;
  confidence: number;
}

export interface PainPoint {
  title: string;
  competitors_cited: string[];
  evidence_count: number;
  urgency: string;
  description: string;
}

export interface CompetitorIntelligence {
  name: string;
  weaknesses: string[];
  strengths: string[];
}

export interface WinZone {
  area: string;
  score: number;
  reason: string;
}

export interface Opportunity {
  title: string;
  confidence_score: number;
  impact: string;
  why_now: string;
  competitors_affected: string[];
  evidence: string[];
  estimated_acquisition_potential: string;
  potential_reason: string;
  strategic_advantage: string;
  execution_strategy: string;
}

export interface StrategicRecommendation {
  action: string;
  impact: string;
  time_horizon: string;
  rationale: string;
}

export interface MarketIntelligence {
  executive_briefing: ExecutiveBriefing;
  market_pulse_score: number;
  market_pulse_explanation: string;
  pain_points: PainPoint[];
  competitor_intelligence: CompetitorIntelligence[];
  smepay_win_zones: WinZone[];
  opportunities: Opportunity[];
  raw_reviews?: RawReview[];
  strategic_recommendations: StrategicRecommendation[];
  _meta?: {
    reviews_analyzed: number;
    generated_at: string;
    model_used: string;
  };
}

export interface RawReview {
  competitor: string;
  rating: number;
  content: string;
  date: string;
}
