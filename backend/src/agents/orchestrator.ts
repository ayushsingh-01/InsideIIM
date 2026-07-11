import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchState } from "../types/graph";

// Import all nodes
import { companyResearchNode } from "./companyResearch";
import { marketDataNode } from "./marketData";
import { financialAnalysisNode } from "./financialAnalysis";
import { technicalAnalysisNode } from "./technicalAnalysis";
import { newsAgentNode } from "./newsAgent";
import { macroAgentNode } from "./macroAgent";
import { valuationAgentNode } from "./valuationAgent";
import { riskAgentNode } from "./riskAgent";
import { decisionAgentNode } from "./decisionAgent";

// Initialize the StateGraph with our root annotation
const workflow = new StateGraph(ResearchState)
  .addNode("agent_1_company", companyResearchNode)
  .addNode("agent_2_market", marketDataNode)
  .addNode("agent_3_financial", financialAnalysisNode)
  .addNode("agent_4_technical", technicalAnalysisNode)
  .addNode("agent_5_news", newsAgentNode)
  .addNode("agent_6_macro", macroAgentNode)
  .addNode("agent_7_valuation", valuationAgentNode)
  .addNode("agent_8_risk", riskAgentNode)
  .addNode("agent_9_decision", decisionAgentNode)

  // Define the sequential edges
  .addEdge(START, "agent_1_company")
  .addEdge("agent_1_company", "agent_2_market")
  .addEdge("agent_2_market", "agent_3_financial")
  .addEdge("agent_3_financial", "agent_4_technical")
  .addEdge("agent_4_technical", "agent_5_news")
  .addEdge("agent_5_news", "agent_6_macro")
  .addEdge("agent_6_macro", "agent_7_valuation")
  .addEdge("agent_7_valuation", "agent_8_risk")
  .addEdge("agent_8_risk", "agent_9_decision")
  .addEdge("agent_9_decision", END);

// Compile the graph
export const researchGraph = workflow.compile();
