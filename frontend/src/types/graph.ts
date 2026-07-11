// Base types for Agent outputs
export interface CompanyResearch {
  industry: string;
  businessModel: string;
  marketCap: number;
  sector: string;
  competitors: string[];
  description: string;
}

export interface MarketData {
  currentPrice: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  volume: number;
  historicalPrices: { date: string; price: number }[];
}

export interface FinancialAnalysis {
  revenueGrowth: number;
  profitGrowth: number;
  operatingMargin: number;
  roe: number;
  debtToEquity: number;
  peRatio: number;
  financialScore: number; // 0-100
  summary: string;
}

export interface TechnicalAnalysis {
  sma50: number;
  sma200: number;
  rsi14: number;
  macd: { value: number; signal: number; histogram: number };
  trend: "BULLISH" | "BEARISH" | "NEUTRAL";
  technicalScore: number; // 0-100
}

export interface NewsAnalysis {
  latestNews: { headline: string; url: string; date: string; summary: string }[];
  overallSentiment: "POSITIVE" | "NEGATIVE" | "NEUTRAL";
  sentimentScore: number; // 0-100 (100 being most positive)
}

export interface MacroAnalysis {
  businessRisks: string[];
  managementGuidance: string;
  macroFactors: string[];
}

export interface ValuationAnalysis {
  intrinsicValue: number;
  valuationStatus: "OVERVALUED" | "FAIR_VALUED" | "UNDERVALUED";
  valuationScore: number; // 0-100
  reasoning: string;
}

export interface RiskAnalysis {
  industryRisks: string[];
  economicRisks: string[];
  corporateGovernanceRisks: string[];
  overallRiskScore: number; // 0-100 (100 being highest risk)
  summary: string;
}

export interface FinalDecision {
  recommendation: "INVEST" | "WATCHLIST" | "PASS";
  reasoning: string;
  confidencePercentage: number;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}

