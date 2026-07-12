import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

/**
 * Fetches the standard quote information for a given ticker.
 */
export async function getQuote(ticker: string) {
  try {
    return await yahooFinance.quote(ticker);
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetches historical price data.
 * @param ticker Stock ticker (e.g., RELIANCE.NS)
 * @param period1 Start date in string format (YYYY-MM-DD)
 */
export async function getHistoricalData(ticker: string, period1: string) {
  try {
    const result = await yahooFinance.chart(ticker, { period1, interval: '1d' });
    return result.quotes || [];
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetches detailed summary data including financials and statistics.
 * @param ticker Stock ticker
 * @param modules Array of summary modules to fetch
 */
export async function getQuoteSummary(ticker: string, modules: string[] = ['financialData', 'defaultKeyStatistics', 'summaryProfile', 'incomeStatementHistory', 'summaryDetail']) {
  try {
    // We suppress TS warning here because yahoo-finance2 types for quoteSummary modules can be restrictive
    // @ts-ignore
    return await yahooFinance.quoteSummary(ticker, { modules });
  } catch (error) {
    console.error(`Error fetching quote summary for ${ticker}:`, error);
    return null;
  }
}
