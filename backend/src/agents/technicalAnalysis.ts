import { ResearchState } from "../types/graph";

export async function technicalAnalysisNode(state: typeof ResearchState.State) {
  const { marketData } = state;
  const prices = marketData?.historicalPrices?.map(h => h.price) || [];
  
  // Note: For a production app, we would use a robust technical indicator library (like technicalindicators)
  // Here we do a simplified simulation for the architecture demonstration
  
  let sma50 = prices.length >= 50 ? prices.slice(0, 50).reduce((a, b) => a + b, 0) / 50 : 0;
  let sma200 = prices.length >= 200 ? prices.slice(0, 200).reduce((a, b) => a + b, 0) / 200 : 0;
  
  if (!sma50 && prices.length > 0) sma50 = prices[0];
  if (!sma200 && prices.length > 0) sma200 = prices[0];

  const currentPrice = marketData?.currentPrice || 0;
  let trend: "BULLISH" | "BEARISH" | "NEUTRAL" = "NEUTRAL";
  let score = 50;

  if (currentPrice > sma50 && sma50 > sma200) {
    trend = "BULLISH";
    score = 80;
  } else if (currentPrice < sma50 && sma50 < sma200) {
    trend = "BEARISH";
    score = 30;
  }

  const technicalAnalysis = {
    sma50,
    sma200,
    rsi14: 55, // Mock RSI
    macd: { value: 1.2, signal: 1.0, histogram: 0.2 }, // Mock MACD
    trend,
    technicalScore: score
  };

  return {
    technicalAnalysis,
    messages: [`Agent 4 (Technical Analysis): Identified a ${trend} trend.`]
  };
}
