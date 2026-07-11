import { ResearchState, DecisionOutputSchema } from "../types/graph";
import { getLLM } from "./llm";
import { HumanMessage } from "@langchain/core/messages";

export async function decisionAgentNode(state: typeof ResearchState.State) {
  const llm = getLLM();
  
  // We feed all aggregated state data to the final decision agent
  const prompt = `You are a Chief Investment Officer. Based on the comprehensive research report for the stock, make a final investment recommendation.

State Data:
${JSON.stringify(state, null, 2)}

Provide your recommendation (INVEST, WATCHLIST, PASS), exact reasoning, confidence percentage, and a SWOT analysis.`;

  const response = await llm.withStructuredOutput(DecisionOutputSchema, {
    name: "investment_decision",
  }).invoke([new HumanMessage(prompt)]);

  return {
    finalDecision: response,
    messages: [`Agent 9 (Decision Agent): Final decision is ${response.recommendation} with ${response.confidencePercentage}% confidence.`]
  };
}
