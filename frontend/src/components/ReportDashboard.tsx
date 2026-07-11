"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { FinalDecision, FinancialAnalysis, MarketData, NewsAnalysis, RiskAnalysis, TechnicalAnalysis, ValuationAnalysis, CompanyResearch, MacroAnalysis } from '../types/graph';
import { Activity, AlertTriangle, TrendingUp, Newspaper, DollarSign, Building, BarChart2 } from 'lucide-react';

interface ReportDashboardProps {
  data: {
    ticker?: string;
    finalDecision?: FinalDecision;
    financialAnalysis?: FinancialAnalysis;
    marketData?: MarketData;
    newsAnalysis?: NewsAnalysis;
    riskAnalysis?: RiskAnalysis;
    technicalAnalysis?: TechnicalAnalysis;
    valuationAnalysis?: ValuationAnalysis;
    companyResearch?: CompanyResearch;
    macroAnalysis?: MacroAnalysis;
  };
}

export function ReportDashboard({ data }: ReportDashboardProps) {
  if (!data.finalDecision) return null;

  const decisionColor = 
    data.finalDecision.recommendation === 'INVEST' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
    data.finalDecision.recommendation === 'WATCHLIST' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
    'bg-red-500/10 text-red-500 border-red-500/20';

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 animate-in fade-in zoom-in duration-500">
      
      {/* Header & Final Decision */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">{data.ticker}</h1>
          <p className="text-muted-foreground">{data.companyResearch?.industry} • {data.companyResearch?.sector}</p>
        </div>
        <Card className={`border ${decisionColor} min-w-[300px]`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex justify-between">
              RECOMMENDATION
              <span className="font-mono">{data.finalDecision.confidencePercentage}% Conf</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{data.finalDecision.recommendation}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Scores Card */}
        <Card className="md:col-span-1 bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Factor Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScoreRow label="Financial Health" score={data.financialAnalysis?.financialScore || 0} />
            <ScoreRow label="Technical Trend" score={data.technicalAnalysis?.technicalScore || 0} />
            <ScoreRow label="Valuation" score={data.valuationAnalysis?.valuationScore || 0} />
            <ScoreRow label="Risk Assessment" score={100 - (data.riskAnalysis?.overallRiskScore || 0)} />
          </CardContent>
        </Card>

        {/* Price Chart */}
        <Card className="md:col-span-2 bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Price Action (30 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            {data.marketData?.historicalPrices && data.marketData.historicalPrices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.marketData.historicalPrices}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="date" tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric'})} stroke="#ffffff50" />
                    <YAxis domain={['auto', 'auto']} stroke="#ffffff50" />
                    <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={false} />
                </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">No historical data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rationale & SWOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Building className="w-4 h-4 text-purple-400" /> Investment Thesis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-sm text-gray-300">{data.finalDecision.reasoning}</p>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-orange-400" /> SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-green-400 mb-2">Strengths</h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                {data.finalDecision.swotAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-red-400 mb-2">Weaknesses</h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                {data.finalDecision.swotAnalysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-blue-400 mb-2">Opportunities</h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                {data.finalDecision.swotAnalysis.opportunities.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-400 mb-2">Threats</h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                {data.finalDecision.swotAnalysis.threats.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}

function ScoreRow({ label, score }: { label: string; score: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span>{label}</span>
        <span className="font-mono">{score.toFixed(0)}/100</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
