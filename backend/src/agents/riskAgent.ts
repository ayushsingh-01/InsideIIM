import { ResearchState } from "../types/graph";

export async function riskAgentNode(state: typeof ResearchState.State) {
  const { macroAnalysis, newsAnalysis } = state;
  
  const industryRisks = macroAnalysis?.businessRisks || [];
  const economicRisks = macroAnalysis?.macroFactors || [];
  const corporateGovernanceRisks: string[] = []; // In a full app, we'd pull from a governance API
  
  if (newsAnalysis?.overallSentiment === "NEGATIVE") {
      corporateGovernanceRisks.push("Recent negative news suggests potential operational or PR risks.");
  }

  // Calculate a mock risk score based on the number of risks identified
  let riskScore = 20; 
  riskScore += industryRisks.length * 5;
  riskScore += economicRisks.length * 5;
  riskScore += corporateGovernanceRisks.length * 10;
  
  riskScore = Math.min(Math.max(riskScore, 0), 100);

  const riskAnalysis = {
    industryRisks,
    economicRisks,
    corporateGovernanceRisks,
    overallRiskScore: riskScore,
    summary: `Identified ${industryRisks.length + economicRisks.length + corporateGovernanceRisks.length} key risk factors. Overall Risk Score: ${riskScore}/100.`
  };

  return {
    riskAnalysis,
    messages: [`Agent 8 (Risk Agent): Calculated overall risk score of ${riskScore}/100.`]
  };
}
