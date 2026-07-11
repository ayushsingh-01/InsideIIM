import { TavilySearch } from "@langchain/tavily";

/**
 * Returns an instance of the Tavily Search Tool.
 * It automatically picks up process.env.TAVILY_API_KEY.
 * @param maxResults Maximum number of search results to return
 */
export function getSearchTool(maxResults = 5) {
  return new TavilySearch({
    maxResults,
  });
}

/**
 * Simple wrapper function if we want to search programmatically instead of passing the tool to an agent.
 */
export async function performWebSearch(query: string, maxResults = 5) {
  const tool = getSearchTool(maxResults);
  try {
    return await tool.invoke({ query });
  } catch (error) {
    console.error(`Error performing web search for "${query}":`, error);
    return null;
  }
}

