import { ResearchState } from "../types/graph";
import { getLLM } from "./llm";
import { performWebSearch } from "../services/searchTool";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

export async function newsAgentNode(state: typeof ResearchState.State) {
  const { ticker } = state;
  const llm = getLLM();
  
  const query = `${ticker} stock latest news today`;
  const searchResults = await performWebSearch(query, 5);
  
  const prompt = `You are a financial news sentiment analyzer. Based on the following recent news snippets for ${ticker}, categorize the overall sentiment and extract the headlines.
  
News Snippets: ${searchResults}`;

  const response = await llm.withStructuredOutput({
    type: "object",
    properties: {
        latestNews: { 
            type: "array", 
            items: { 
                type: "object",
                properties: {
                    headline: { type: "string" },
                    url: { type: "string" },
                    date: { type: "string" },
                    summary: { type: "string" }
                }
            } 
        },
        overallSentiment: { type: "string", enum: ["POSITIVE", "NEGATIVE", "NEUTRAL"] },
        sentimentScore: { type: "number" }
    }
  }, {
    name: "news_sentiment",
  }).invoke([new HumanMessage(prompt)]);

  return {
    newsAnalysis: response,
    messages: [`Agent 5 (News Agent): Analyzed latest news. Overall sentiment is ${response.overallSentiment}.`]
  };
}
