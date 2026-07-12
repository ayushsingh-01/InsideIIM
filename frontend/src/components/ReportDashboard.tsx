"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FinalDecision, FinancialAnalysis, MarketData, NewsAnalysis, RiskAnalysis, TechnicalAnalysis, ValuationAnalysis, CompanyResearch, MacroAnalysis } from '../types/graph';
import { Activity, TrendingUp, Building, BarChart2 } from 'lucide-react';

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
    data.finalDecision.recommendation === 'INVEST' ? 'border-[#4caf50] text-[#4caf50] bg-green-50/30' :
    data.finalDecision.recommendation === 'WATCHLIST' ? 'border-[#f59e0b] text-[#f59e0b] bg-amber-50/30' :
    'border-[#ef4444] text-[#ef4444] bg-red-50/30';

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 animate-in fade-in zoom-in duration-500 text-[#444444]">
      
      {/* Header & Final Decision */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[#444444]">{data.ticker}</h1>
          <p className="text-xs text-gray-500 mt-1 font-semibold">{data.companyResearch?.industry} • {data.companyResearch?.sector}</p>
        </div>
        <Card className={`border ${decisionColor} min-w-[300px] shadow-sm`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold flex justify-between text-[#9b9b9b] uppercase tracking-wider">
              RECOMMENDATION
              <span className="font-mono text-gray-500 font-bold">{data.finalDecision.confidencePercentage}% Conf</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">{data.finalDecision.recommendation}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Scores Card */}
        <Card className="md:col-span-1 bg-white border-[#e0e0e0] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b9b9b]"><Activity className="w-4 h-4 text-[#ff5722]" /> Factor Scores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <ScoreRow label="Financial Health" score={data.financialAnalysis?.financialScore || 0} />
            <ScoreRow label="Technical Trend" score={data.technicalAnalysis?.technicalScore || 0} />
            <ScoreRow label="Valuation" score={data.valuationAnalysis?.valuationScore || 0} />
            <ScoreRow label="Risk Assessment" score={100 - (data.riskAnalysis?.overallRiskScore || 0)} />
          </CardContent>
        </Card>

        {/* Price Chart */}
        <Card className="md:col-span-2 bg-white border-[#e0e0e0] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b9b9b]"><TrendingUp className="w-4 h-4 text-[#387ed1]" /> Price Action</CardTitle>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="bg-white border border-[#cccccc] text-[#444444] rounded-md px-2 py-1 text-xs focus:outline-none focus:border-[#ff5722] cursor-pointer font-semibold"
            >
              <option value="7d">1 Week</option>
              <option value="30d">30 Days</option>
              <option value="60d">60 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
          </CardHeader>
          <CardContent className="h-[250px] w-full pt-4">
            {filteredPrices && filteredPrices.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={filteredPrices}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f2f2f2" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(v) => new Date(v).toLocaleDateString(undefined, {month:'short', day:'numeric'})} 
                      stroke="#9b9b9b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      domain={['auto', 'auto']} 
                      stroke="#9b9b9b" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      orientation="right" 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#444444', fontSize: '11px' }} 
                    />
                    {/* solid crisp dark line like Kite */}
                    <Line type="monotone" dataKey="price" stroke="#111111" strokeWidth={1.8} dot={false} />
                </LineChart>
                </ResponsiveContainer>
            ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-[#9b9b9b]">No historical data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Rationale & SWOT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border-[#e0e0e0] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b9b9b]"><Building className="w-4 h-4 text-purple-600" /> Investment Thesis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="leading-relaxed text-sm text-[#555555]">{data.finalDecision.reasoning}</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-[#e0e0e0] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b9b9b]"><BarChart2 className="w-4 h-4 text-orange-600" /> SWOT Analysis</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-xs font-sans">
            <div className="bg-green-50/20 border border-green-100 p-3 rounded">
              <h3 className="font-bold text-green-700 mb-1.5">Strengths</h3>
              <ul className="list-disc pl-4 space-y-1 text-[#555555]">
                {data.finalDecision.swotAnalysis.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-red-50/20 border border-red-100 p-3 rounded">
              <h3 className="font-bold text-red-700 mb-1.5">Weaknesses</h3>
              <ul className="list-disc pl-4 space-y-1 text-[#555555]">
                {data.finalDecision.swotAnalysis.weaknesses.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-blue-50/20 border border-blue-100 p-3 rounded">
              <h3 className="font-bold text-blue-700 mb-1.5">Opportunities</h3>
              <ul className="list-disc pl-4 space-y-1 text-[#555555]">
                {data.finalDecision.swotAnalysis.opportunities.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
            <div className="bg-amber-50/20 border border-amber-100 p-3 rounded">
              <h3 className="font-bold text-amber-700 mb-1.5">Threats</h3>
              <ul className="list-disc pl-4 space-y-1 text-[#555555]">
                {data.finalDecision.swotAnalysis.threats.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 9 Agents Decisions & Graph Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Decisions List Card */}
        <Card className="bg-white border-[#e0e0e0] shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b9b9b]"><Activity className="w-4 h-4 text-[#ff5722]" /> Multi-Agent Decisions Log</CardTitle>
            <CardDescription className="text-[11px] text-[#9b9b9b] font-medium font-sans">Decisions and metrics output by each of the 9 specialized agents</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3.5 text-xs">
            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 1: Company Profiler</span>
                <span className="text-[#666666] text-[11px]">Sector classification and business description.</span>
              </div>
              <div className="text-right">
                <span className="font-semibold block text-[#444444]">{data.companyResearch?.sector || 'Unknown'}</span>
                <span className="text-[#9b9b9b] text-[10px]">{data.companyResearch?.industry || 'Unknown'}</span>
              </div>
            </div>
            
            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 2: Market Data Feed</span>
                <span className="text-[#666666] text-[11px]">Price feed tracking and 52W range logs.</span>
              </div>
              <div className="text-right font-mono">
                <span className="font-semibold block text-[#444444]">₹{data.marketData?.currentPrice || 'N/A'}</span>
                <span className="text-[#9b9b9b] text-[10px]">52W Range: ₹{data.marketData?.fiftyTwoWeekLow || 'N/A'} - ₹{data.marketData?.fiftyTwoWeekHigh || 'N/A'}</span>
              </div>
            </div>

            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 3: Financial Analysis</span>
                <span className="text-[#666666] text-[11px]">P&L evaluation, margins, and yield computations.</span>
              </div>
              <div className="text-right">
                <span className="font-semibold block text-[#444444]">Score: {data.financialAnalysis?.financialScore.toFixed(0) || '0'}/100</span>
                <span className="text-[#9b9b9b] text-[10px] font-mono">
                  ROE: {data.financialAnalysis?.roe !== undefined && data.financialAnalysis?.roe !== null && data.financialAnalysis?.roe !== 0 ? (data.financialAnalysis.roe * 100).toFixed(1) + '%' : 'N/A'}, 
                  P/E: {data.financialAnalysis?.peRatio !== undefined && data.financialAnalysis?.peRatio !== null && data.financialAnalysis?.peRatio !== 0 ? data.financialAnalysis.peRatio.toFixed(1) : 'N/A'}
                </span>
              </div>
            </div>

            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 4: Technical Analysis</span>
                <span className="text-[#666666] text-[11px]">Moving averages, RSI trends, and MACD indicators.</span>
              </div>
              <div className="text-right">
                <span className={`font-semibold block ${
                  data.technicalAnalysis?.trend === 'BULLISH' ? 'text-[#4caf50]' :
                  data.technicalAnalysis?.trend === 'BEARISH' ? 'text-[#ef4444]' : 'text-[#f59e0b]'
                }`}>{data.technicalAnalysis?.trend || 'NEUTRAL'}</span>
                <span className="text-[#9b9b9b] text-[10px] font-mono">Score: {data.technicalAnalysis?.technicalScore.toFixed(0) || '0'}/100, RSI: {data.technicalAnalysis?.rsi14 || 'N/A'}</span>
              </div>
            </div>

            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 5: News Sentiment Analyzer</span>
                <span className="text-[#666666] text-[11px]">Real-time public consensus and media scoring.</span>
              </div>
              <div className="text-right">
                <span className="font-semibold block text-[#444444]">{data.newsAnalysis?.overallSentiment || 'NEUTRAL'}</span>
                <span className="text-[#9b9b9b] text-[10px] font-mono">Score: {data.newsAnalysis?.sentimentScore.toFixed(0) || '0'}/100</span>
              </div>
            </div>

            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 6: Macro Headwinds</span>
                <span className="text-[#666666] text-[11px]">Macroeconomic threats and governance audits.</span>
              </div>
              <div className="text-right">
                <span className="font-semibold block text-[#444444]">Headwinds Count</span>
                <span className="text-[#9b9b9b] text-[10px]">{data.macroAnalysis?.macroFactors.length || 0} Risks Identified</span>
              </div>
            </div>

            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 7: Valuation Audit</span>
                <span className="text-[#666666] text-[11px]">Multiple valuations and pricing targets.</span>
              </div>
              <div className="text-right">
                <span className="font-semibold block text-[#444444]">{data.valuationAnalysis?.valuationStatus || 'FAIR_VALUED'}</span>
                <span className="text-[#9b9b9b] text-[10px] font-mono">Score: {data.valuationAnalysis?.valuationScore.toFixed(0) || '0'}/100</span>
              </div>
            </div>

            <div className="border-b border-[#f9f9f9] pb-2 flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 8: Risk Assessor</span>
                <span className="text-[#666666] text-[11px]">Risk weight assessment and audit compilation.</span>
              </div>
              <div className="text-right">
                <span className="font-semibold block text-[#444444]">Risk: {data.riskAnalysis?.overallRiskScore.toFixed(0) || '0'}/100</span>
                <span className="text-[#9b9b9b] text-[10px] font-mono">Safety: {(100 - (data.riskAnalysis?.overallRiskScore || 0)).toFixed(0)}/100</span>
              </div>
            </div>

            <div className="flex justify-between">
              <div>
                <span className="font-bold text-[#ff5722] block">Agent 9: Chief Decision Officer</span>
                <span className="text-[#666666] text-[11px]">Compiles the final investment trade verdict.</span>
              </div>
              <div className="text-right">
                <span className={`font-bold block uppercase ${
                  data.finalDecision.recommendation === 'INVEST' ? 'text-[#4caf50]' :
                  data.finalDecision.recommendation === 'WATCHLIST' ? 'text-[#f59e0b]' : 'text-[#ef4444]'
                }`}>{data.finalDecision.recommendation}</span>
                <span className="text-[#9b9b9b] text-[10px] font-mono">{data.finalDecision.confidencePercentage}% Confidence</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recharts Pie Chart Graph Card */}
        <Card className="bg-white border-[#e0e0e0] shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9b9b9b]"><BarChart2 className="w-4 h-4 text-green-600" /> Factor Score Distribution</CardTitle>
            <CardDescription className="text-[11px] text-[#9b9b9b] font-medium font-sans">Weight breakdown of the core scores evaluated</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center h-[350px] pt-4">
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
                <Tooltip formatter={(value) => [`${value}/100`, 'Score']} contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#444444' }} />
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
    <div className="font-sans">
      <div className="flex justify-between text-xs font-semibold text-[#666666] mb-1.5">
        <span>{label}</span>
        <span className="font-mono text-[#444444]">{score.toFixed(0)}/100</span>
      </div>
      <div className="w-full bg-[#eeeeee] rounded-sm h-1.5">
        <div 
          className="bg-[#387ed1] h-1.5 rounded-sm transition-all duration-1000" 
          style={{ width: `${score}%` }} 
        />
      </div>
    </div>
  );
}
