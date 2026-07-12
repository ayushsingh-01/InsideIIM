import { ResearchState } from "../types/graph";
import { getQuoteSummary } from "../services/yahooFinance";

export async function financialAnalysisNode(state: typeof ResearchState.State) {
  const { ticker } = state;
  
  const summary = await getQuoteSummary(ticker);
  
  const financialData = summary?.financialData;
  const defaultKeyStatistics = summary?.defaultKeyStatistics;
  
  // Extract key metrics safely
  const revenueGrowth = financialData?.revenueGrowth || 0;
  const profitGrowth = financialData?.earningsGrowth || 0;
  const operatingMargin = financialData?.operatingMargins || 0;
  const roe = financialData?.returnOnEquity || 0;
  const debtToEquity = financialData?.debtToEquity || 0;
  const peRatio = summary?.summaryDetail?.forwardPE || summary?.summaryDetail?.trailingPE || 0;

  // Simple heuristic scoring (0-100)
  let score = 50;
  if (revenueGrowth > 0.1) score += 10;
  if (profitGrowth > 0.1) score += 10;
  if (operatingMargin > 0.15) score += 10;
  if (roe > 0.15) score += 10;
  if (debtToEquity < 100) score += 10; // Debt/Equity is often represented in percentages or ratios

  // Clamp score
  score = Math.min(Math.max(score, 0), 100);

  const financialAnalysis = {
    revenueGrowth,
    profitGrowth,
    operatingMargin,
    roe,
    debtToEquity,
    peRatio,
    financialScore: score,
    summary: `Based on financial data, the company has a profit growth of ${(profitGrowth*100).toFixed(2)}% and operating margin of ${(operatingMargin*100).toFixed(2)}%.`
  };

  return {
    financialAnalysis,
    messages: [`Agent 3 (Financial Analysis): Calculated financial score of ${score}/100.`]
  };
}
