import { ResearchState } from "../types/graph";
import { getLLM } from "./llm";
import { performWebSearch } from "../services/searchTool";
import { HumanMessage } from "@langchain/core/messages";

export async function macroAgentNode(state: typeof ResearchState.State) {
  const { ticker, companyResearch } = state;
  const llm = getLLM();
  
  const query = `${companyResearch?.industry || ticker} industry macro economic factors, business risks, management guidance`;
  const searchResults = await performWebSearch(query, 3);
  
  const prompt = `You are an economic analyst. Based on the web search results for the ${companyResearch?.industry} industry and ${ticker}, extract macro factors, business risks, and management guidance (if any).
  
Search Results: ${searchResults}`;

  const response = await llm.withStructuredOutput({
    type: "object",
    properties: {
        businessRisks: { type: "array", items: { type: "string" } },
        managementGuidance: { type: "string" },
        macroFactors: { type: "array", items: { type: "string" } }
    }
  }, {
    name: "macro_analysis",
  }).invoke([new HumanMessage(prompt)]);

  return {
    macroAnalysis: response,
    messages: [`Agent 6 (Macro Agent): Identified ${response.businessRisks.length} business risks.`]
  };
}
