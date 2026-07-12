"use client";

import React from 'react';
import { CheckCircle2, CircleDashed } from 'lucide-react';

interface LoadingUIProps {
  progressEvents: { agent: string, message: string }[];
}

export function LoadingUI({ progressEvents }: LoadingUIProps) {
  // Ordered list of agents for visual checklist
  const allAgents = [
    { id: "agent_1_company", name: "Company Research" },
    { id: "agent_2_market", name: "Market Data" },
    { id: "agent_3_financial", name: "Financial Analysis" },
    { id: "agent_4_technical", name: "Technical Analysis" },
    { id: "agent_5_news", name: "News Sentiment" },
    { id: "agent_6_macro", name: "Macro Factors" },
    { id: "agent_7_valuation", name: "Valuation" },
    { id: "agent_8_risk", name: "Risk Assessment" },
    { id: "agent_9_decision", name: "Final Decision" }
  ];

  const completedAgents = progressEvents.map(e => e.agent);

  return (
    <div className="w-full max-w-2xl mx-auto mt-12 p-8 rounded-2xl bg-white border border-[#e0e0e0] shadow-md text-[#444444]">
      <div className="text-center mb-8">
        <div className="inline-block relative w-16 h-16 mb-4">
          <div className="absolute inset-0 border-4 border-[#ff5722]/30 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-[#ff5722] rounded-full border-t-transparent animate-spin"></div>
        </div>
        <h2 className="text-2xl font-bold">Researching...</h2>
        <p className="text-gray-500 mt-2">Our AI agents are analyzing millions of data points</p>
      </div>

      <div className="space-y-4">
        {allAgents.map((agent) => {
          const isComplete = completedAgents.includes(agent.id);
          const isActive = progressEvents.length === completedAgents.length && 
                           completedAgents.length > 0 && 
                           !isComplete && 
                           allAgents.findIndex(a => a.id === agent.id) === completedAgents.length;
                           
          // If we haven't started this agent and it's not the next one
          const isPending = !isComplete && !isActive;

          return (
            <div key={agent.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-orange-50 border border-orange-100' : ''}`}>
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : isActive ? (
                <CircleDashed className="w-5 h-5 text-[#ff5722] animate-spin" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
              )}
              <div className="flex-1">
                <div className={`font-medium ${isComplete ? 'text-[#444444]' : isActive ? 'text-[#ff5722]' : 'text-gray-400'}`}>
                  {agent.name}
                </div>
                {isComplete && (
                  <div className="text-xs text-gray-500">
                    {progressEvents.find(e => e.agent === agent.id)?.message}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
