import { ResearchState } from "../types/graph";
import { getQuote, getHistoricalData } from "../services/yahooFinance";

export async function marketDataNode(state: typeof ResearchState.State) {
  const { ticker } = state;
  
  const quote = await getQuote(ticker);
  
  // Get historical data for the last 30 days
  const date30DaysAgo = new Date();
  date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);
  const period1 = date30DaysAgo.toISOString().split('T')[0];
  const historical = await getHistoricalData(ticker, period1);
  
  const marketData = {
    currentPrice: quote?.regularMarketPrice || 0,
    fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekLow: quote?.fiftyTwoWeekLow || 0,
    volume: quote?.regularMarketVolume || 0,
    historicalPrices: (historical || []).map(h => ({
      date: h.date.toISOString(),
      price: h.close
    }))
  };

  return {
    marketData,
    messages: [`Agent 2 (Market Data): Retrieved current price ₹${marketData.currentPrice} and 52W range.`]
  };
}
