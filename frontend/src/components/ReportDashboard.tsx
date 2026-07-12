"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
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

  const [timeframe, setTimeframe] = React.useState<'7d' | '30d' | '60d' | '90d' | '1y'>('30d');

  const pieData = [
    { name: 'Financial Health', value: Math.round(data.financialAnalysis?.financialScore || 0) },
    { name: 'Technical Trend', value: Math.round(data.technicalAnalysis?.technicalScore || 0) },
    { name: 'Valuation', value: Math.round(data.valuationAnalysis?.valuationScore || 0) },
    { name: 'Sentiment', value: Math.round(data.newsAnalysis?.sentimentScore || 0) },
    { name: 'Safety Level', value: Math.round(100 - (data.riskAnalysis?.overallRiskScore || 0)) },
  ];
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const getFilteredPrices = () => {
    const prices = data.marketData?.historicalPrices || [];
    if (prices.length === 0) return [];
    
    const sorted = [...prices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latestDate = new Date(sorted[sorted.length - 1].date);
    
    let daysToSubtract = 30;
    if (timeframe === '7d') daysToSubtract = 7;
    else if (timeframe === '30d') daysToSubtract = 30;
    else if (timeframe === '60d') daysToSubtract = 60;
    else if (timeframe === '90d') daysToSubtract = 90;
    else if (timeframe === '1y') daysToSubtract = 365;
    
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(latestDate.getDate() - daysToSubtract);
    
    return sorted.filter(p => new Date(p.date) >= cutoffDate);
  };
  
  const filteredPrices = getFilteredPrices();

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
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" /> Price Action</CardTitle>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-neutral-900 border border-white/10 text-white rounded-md px-2 py-1 text-xs focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="7d">1 Week</option>
              <option value="30d">30 Days</option>
              <option value="60d">60 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </CardHeader>
          <CardContent className="h-[250px] w-full">
            {filteredPrices && filteredPrices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredPrices}>
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

      {/* 9 Agents Decisions & Graph Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Decisions List Card */}
        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400" /> Multi-Agent Decisions Log</CardTitle>
            <CardDescription>Decisions and metrics output by each of the 9 specialized agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-sm">
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 1 (Company Profiler): </span>
              <span className="text-gray-300">Classified company in the <strong className="text-white">{data.companyResearch?.sector || 'Unknown'}</strong> sector / <strong className="text-white">{data.companyResearch?.industry || 'Unknown'}</strong> industry.</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 2 (Market Data): </span>
              <span className="text-gray-300">Recorded current price of <strong className="text-white">₹{data.marketData?.currentPrice || 'N/A'}</strong> (52W Range: ₹{data.marketData?.fiftyTwoWeekLow || 'N/A'} - ₹{data.marketData?.fiftyTwoWeekHigh || 'N/A'}).</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 3 (Financial Analyst): </span>
              <span className="text-gray-300">Calculated financial score of <strong className="text-white">{(data.financialAnalysis?.financialScore ?? 0).toFixed(0)}/100</strong> (ROE: {data.financialAnalysis?.roe !== undefined && data.financialAnalysis?.roe !== null && data.financialAnalysis?.roe !== 0 ? (data.financialAnalysis.roe * 100).toFixed(1) + '%' : 'N/A'}, P/E: {data.financialAnalysis?.peRatio !== undefined && data.financialAnalysis?.peRatio !== null && data.financialAnalysis?.peRatio !== 0 ? data.financialAnalysis.peRatio.toFixed(1) : 'N/A'}).</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 4 (Technical Trend): </span>
              <span className="text-gray-300">Determined a <strong className={data.technicalAnalysis?.trend === 'BULLISH' ? 'text-green-400' : data.technicalAnalysis?.trend === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'}>{data.technicalAnalysis?.trend || 'NEUTRAL'}</strong> trend (Score: {data.technicalAnalysis?.technicalScore.toFixed(0) || '0'}/100, RSI: {data.technicalAnalysis?.rsi14 || 'N/A'}).</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 5 (News Sentiment): </span>
              <span className="text-gray-300">Aggregated sentiment as <strong className="text-white">{data.newsAnalysis?.overallSentiment || 'NEUTRAL'}</strong> (Sentiment Score: {data.newsAnalysis?.sentimentScore.toFixed(0) || '0'}/100).</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 6 (Macro HEADWINDS): </span>
              <span className="text-gray-300">Identified {data.macroAnalysis?.macroFactors.length || 0} macro headwinds and evaluated governance risks.</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 7 (Valuation): </span>
              <span className="text-gray-300">Determined value as <strong className="text-white">{data.valuationAnalysis?.valuationStatus || 'FAIR_VALUED'}</strong> (Score: {data.valuationAnalysis?.valuationScore.toFixed(0) || '0'}/100).</span>
            </div>
            <div className="border-b border-white/5 pb-2">
              <span className="font-semibold text-blue-400">Agent 8 (Risk Assessor): </span>
              <span className="text-gray-300">Calculated overall risk score of <strong className="text-white">{data.riskAnalysis?.overallRiskScore.toFixed(0) || '0'}/100</strong> (Safety Level: {(100 - (data.riskAnalysis?.overallRiskScore || 0)).toFixed(0)}/100).</span>
            </div>
            <div>
              <span className="font-semibold text-blue-400">Agent 9 (Chief Decision Officer): </span>
              <span className="text-gray-300">Compiled final recommendation: <strong className={data.finalDecision.recommendation === 'INVEST' ? 'text-green-400' : 'text-yellow-400'}>{data.finalDecision.recommendation}</strong> ({data.finalDecision.confidencePercentage}% confidence).</span>
            </div>
          </CardContent>
        </Card>

        {/* Recharts Pie Chart Graph Card */}
        <Card className="bg-black/40 backdrop-blur-md border-white/10 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5 text-green-400" /> Factor Score Distribution</CardTitle>
            <CardDescription>Visual breakdown of the scores contributing to the Chief Decision Officer's verdict</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={85}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}/100`, 'Score']} contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
              </PieChart>
            </ResponsiveContainer>
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
