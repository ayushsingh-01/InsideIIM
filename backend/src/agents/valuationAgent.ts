import { ResearchState } from "../types/graph";

export async function valuationAgentNode(state: typeof ResearchState.State) {
  const { financialAnalysis, marketData, companyResearch } = state;
  
  // A simplistic DCF / Relative valuation heuristic
  const peRatio = financialAnalysis?.peRatio || 0;
  const currentPrice = marketData?.currentPrice || 0;
  
  let status: "OVERVALUED" | "FAIR_VALUED" | "UNDERVALUED" = "FAIR_VALUED";
  let score = 50;
  
  // Basic heuristic: P/E < 15 might be undervalued, P/E > 30 might be overvalued (highly dependent on sector)
  if (peRatio > 0 && peRatio < 15) {
      status = "UNDERVALUED";
      score = 80;
  } else if (peRatio > 30) {
      status = "OVERVALUED";
      score = 30;
  }

  const intrinsicValue = currentPrice * (score / 50); // Dummy intrinsic value calc for demonstration

  const valuationAnalysis = {
    intrinsicValue,
    valuationStatus: status,
    valuationScore: score,
    reasoning: `Based on a P/E ratio of ${peRatio.toFixed(2)}, the company is considered ${status}.`
  };

  return {
    valuationAnalysis,
    messages: [`Agent 7 (Valuation Agent): Determined stock is ${status} with score ${score}/100.`]
  };
}
