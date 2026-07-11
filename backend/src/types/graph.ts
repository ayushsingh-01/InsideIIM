import { Annotation } from "@langchain/langgraph";
import { z } from "zod";

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

// Validation Schema for the Final Output using Zod
export const DecisionOutputSchema = z.object({
  recommendation: z.enum(["INVEST", "WATCHLIST", "PASS"]),
  reasoning: z.string().describe("Detailed reasoning for the recommendation."),
  confidencePercentage: z.number().min(0).max(100).describe("Confidence in the recommendation from 0 to 100."),
  swotAnalysis: z.object({
    strengths: z.array(z.string()),
    weaknesses: z.array(z.string()),
    opportunities: z.array(z.string()),
    threats: z.array(z.string()),
  }),
});

// LangGraph State Annotation
export const ResearchState = Annotation.Root({
  ticker: Annotation<string>,
  companyResearch: Annotation<CompanyResearch | null>,
  marketData: Annotation<MarketData | null>,
  financialAnalysis: Annotation<FinancialAnalysis | null>,
  technicalAnalysis: Annotation<TechnicalAnalysis | null>,
  newsAnalysis: Annotation<NewsAnalysis | null>,
  macroAnalysis: Annotation<MacroAnalysis | null>,
  valuationAnalysis: Annotation<ValuationAnalysis | null>,
  riskAnalysis: Annotation<RiskAnalysis | null>,
  finalDecision: Annotation<FinalDecision | null>,
  
  // To track agent progress for the UI
  messages: Annotation<string[]>({
    reducer: (curr, update) => curr.concat(update),
    default: () => [],
  }),
});
