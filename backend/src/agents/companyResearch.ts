import { ResearchState } from "../types/graph";
import { getLLM } from "./llm";
import { performWebSearch } from "../services/searchTool";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function companyResearchNode(state: typeof ResearchState.State) {
  const { ticker } = state;
  const llm = getLLM();
  
  // 1. Gather context via web search
  const query = `${ticker} company overview, business model, industry, sector, main competitors`;
  const searchResults = await performWebSearch(query, 3);
  
  // 2. Extract structured data
  const prompt = `You are a financial analyst. Based on the following web search results for the stock ticker ${ticker}, extract the company's industry, business model, sector, and main competitors. Format as JSON.
  
Search Results: ${searchResults}`;

  // For real production we'd use .withStructuredOutput, but this illustrates the flow
  const response = await llm.withStructuredOutput({
    type: "object",
    properties: {
        industry: { type: "string" },
        businessModel: { type: "string" },
        sector: { type: "string" },
        competitors: { type: "array", items: { type: "string" } },
        description: { type: "string" },
        marketCap: { type: "number", description: "Estimate market cap in billions if available, else 0" }
    }
  }, {
    name: "company_research",
  }).invoke([new HumanMessage(prompt)]);

  return {
    companyResearch: response,
    messages: [`Agent 1 (Company Research): Gathered profile for ${ticker} in the ${response.sector} sector.`]
  };
}
