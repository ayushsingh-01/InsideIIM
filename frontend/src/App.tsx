import React, { useState, useEffect } from "react";
import { Search, TrendingUp, History, Clock, ArrowRight, Trash2, User, Briefcase, RefreshCw, X } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Badge } from "./components/ui/badge";
import { LoadingUI } from "./components/LoadingUI";
import { ReportDashboard } from "./components/ReportDashboard";

interface PastResearch {
  _id: string;
  ticker: string;
  createdAt: string;
  finalDecision?: {
    recommendation: "INVEST" | "WATCHLIST" | "PASS";
    confidencePercentage: number;
  };
  companyResearch?: {
    industry: string;
    sector: string;
  };
  marketData?: {
    currentPrice: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [ticker, setTicker] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "complete" | "error">("idle");
  const [progressEvents, setProgressEvents] = useState<{ agent: string, message: string }[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<PastResearch[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "report">("dashboard");

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/api/research/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Error fetching history:", err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticker.trim()) return;
    startResearch(ticker);
  };

  const startResearch = (tickerToSearch: string) => {
    setStatus("loading");
    setActiveTab("dashboard");
    setProgressEvents([]);
    setReportData(null);
    setErrorMsg("");

    const tickerUpper = tickerToSearch.toUpperCase();
    const eventSource = new EventSource(`${API_URL}/api/research/stream?ticker=${encodeURIComponent(tickerUpper)}`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "progress") {
          setProgressEvents(prev => [...prev, { agent: data.agent, message: data.message }]);
        } else if (data.type === "done") {
          setReportData(data.data);
          setStatus("complete");
          setActiveTab("report");
          eventSource.close();
          fetchHistory();
        } else if (data.type === "error") {
          setErrorMsg(data.message || "An error occurred during research.");
          setStatus("error");
          eventSource.close();
        }
      } catch (e) {
        console.error("Error parsing message chunk:", e);
      }
    };

    eventSource.onerror = (err) => {
      console.error("EventSource failed:", err);
      setErrorMsg("Connection to research stream failed. Ensure your server is running and database is connected.");
      setStatus("error");
      eventSource.close();
    };
  };

  const loadPastReport = async (pastTicker: string) => {
    setStatus("loading");
    setProgressEvents([]);
    setErrorMsg("");
    try {
      const res = await fetch(`${API_URL}/api/research/report/${encodeURIComponent(pastTicker)}`);
      if (!res.ok) {
        throw new Error("Failed to load report from server.");
      }
      const data = await res.json();
      setReportData(data);
      setStatus("complete");
      setActiveTab("report");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Could not retrieve report.");
      setStatus("error");
    }
  };

  const handleDeleteReport = async (e: React.MouseEvent, tickerToDelete: string) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete the research report for ${tickerToDelete}?`)) {
      return;
    }
    try {
      const res = await fetch(`${API_URL}/api/research/report/${encodeURIComponent(tickerToDelete)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchHistory();
        if (reportData?.ticker === tickerToDelete) {
          setReportData(null);
          setActiveTab("dashboard");
          setStatus("idle");
        }
      } else {
        alert("Failed to delete the report.");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("An error occurred while deleting the report.");
    }
  };

  // Helper values for Dashboard UI
  const totalInvestment = history.reduce((acc, curr) => acc + (curr.marketData?.currentPrice || 100), 0);
  const passCount = history.filter(h => h.finalDecision?.recommendation === "PASS").length;
  const investCount = history.filter(h => h.finalDecision?.recommendation === "INVEST").length;
  const watchlistCount = history.filter(h => h.finalDecision?.recommendation === "WATCHLIST").length;

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#444444] font-sans antialiased flex flex-col selection:bg-orange-100">
      
      {/* Top Header Bar */}
      <header className="h-[45px] border-b border-[#e0e0e0] bg-white flex justify-between items-center px-6 text-xs select-none z-40 shrink-0">
        {/* Market Tickers */}
        <div className="flex items-center gap-6 font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-[#9b9b9b] font-sans font-semibold">NIFTY 50</span>
            <span className="text-[#4caf50] font-bold">24,206.90</span>
            <span className="text-[#4caf50] font-medium">+241.10 (1.02%)</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-[#e0e0e0] pl-6">
            <span className="text-[#9b9b9b] font-sans font-semibold">SENSEX</span>
            <span className="text-[#4caf50] font-bold">77,569.39</span>
            <span className="text-[#4caf50] font-medium">+827.57 (1.08%)</span>
          </div>
        </div>

        {/* Tab Navigation & Profile */}
        <div className="flex items-center gap-8 h-full">
          <nav className="flex h-full items-center font-semibold text-xs tracking-wide">
            <button 
              onClick={() => setActiveTab("dashboard")} 
              className={`h-full px-4 border-b-2 transition-all cursor-pointer ${
                activeTab === "dashboard" 
                  ? "border-[#ff5722] text-[#ff5722]" 
                  : "border-transparent text-[#666666] hover:text-[#ff5722]"
              }`}
            >
              Dashboard
            </button>
            {reportData && (
              <button 
                onClick={() => setActiveTab("report")} 
                className={`h-full px-4 border-b-2 transition-all cursor-pointer ${
                  activeTab === "report" 
                    ? "border-[#ff5722] text-[#ff5722]" 
                    : "border-transparent text-[#666666] hover:text-[#ff5722]"
                }`}
              >
                Research: {reportData.ticker}
              </button>
            )}
          </nav>
          
          <div className="flex items-center gap-2 border-l border-[#e0e0e0] pl-6 h-full text-[#666666]">
            <User className="w-4 h-4 text-[#ff5722]" />
            <span className="font-semibold text-xs font-mono">Ayush / WGJ507</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Split Layout */}
      <div className="flex-1 flex overflow-hidden w-full relative">
        
        {/* Left Watchlist Sidebar */}
        <aside className="w-[350px] border-r border-[#e0e0e0] bg-white flex flex-col shrink-0 select-none z-30">
          
          {/* Watchlist Search Bar */}
          <form onSubmit={handleSearchSubmit} className="p-3 border-b border-[#eeeeee] relative flex items-center bg-[#fafafa]">
            <Search className="absolute left-6 w-4 h-4 text-[#9b9b9b]" />
            <Input 
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="Search eg: infy bse, nifty fut, RELIANCE.NS"
              className="pl-9 pr-4 h-[36px] bg-white border border-[#cccccc] focus-visible:ring-1 focus-visible:ring-[#ff5722] rounded-md text-xs placeholder:text-gray-400 w-full"
            />
          </form>

          {/* Watchlist Items list */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#f2f2f2]">
            {history.length > 0 ? (
              history.map((item, idx) => {
                const rec = item.finalDecision?.recommendation;
                
                // Realistic mock changes based on recommendation
                const changeVal = rec === 'INVEST' ? '+48.50' : rec === 'WATCHLIST' ? '+5.20' : '-32.10';
                const changePct = rec === 'INVEST' ? '+1.92%' : rec === 'WATCHLIST' ? '+0.22%' : '-2.34%';
                const isGreen = rec !== 'PASS';
                const colorClass = isGreen ? 'text-[#4caf50]' : 'text-[#ff5722]';

                return (
                  <div 
                    key={item._id}
                    onClick={() => loadPastReport(item.ticker)}
                    className={`p-4 flex justify-between items-center cursor-pointer group transition-colors select-none ${
                      reportData?.ticker === item.ticker && activeTab === "report"
                        ? "bg-orange-50/50 border-l-2 border-[#ff5722]" 
                        : "hover:bg-[#f9f9f9]"
                    }`}
                  >
                    {/* Ticker & Industry details */}
                    <div className="space-y-0.5">
                      <div className="font-bold text-[13px] text-[#444444] font-sans flex items-center gap-1.5">
                        <span>{item.ticker}</span>
                        {rec && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-sm border font-semibold ${
                            rec === 'INVEST' ? 'bg-green-50 text-green-600 border-green-200' :
                            rec === 'WATCHLIST' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                            'bg-red-50 text-red-600 border-red-200'
                          }`}>
                            {rec}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#9b9b9b] truncate max-w-[150px]">
                        {item.companyResearch?.industry || "Stock Asset"}
                      </div>
                    </div>

                    {/* Pricing & Change indicators */}
                    <div className="flex items-center gap-4">
                      <div className="text-right font-mono text-xs font-semibold">
                        <div className="text-[#444444]">{(item.marketData?.currentPrice || 1500).toFixed(2)}</div>
                        <div className={`text-[10px] font-medium flex items-center justify-end gap-1 ${colorClass}`}>
                          <span>{changeVal}</span>
                          <span>{changePct}</span>
                        </div>
                      </div>

                      {/* Watchlist Actions hoverable overlay */}
                      <div className="hidden group-hover:flex items-center gap-1 bg-white pl-2">
                        <button 
                          onClick={(e) => handleDeleteReport(e, item.ticker)}
                          className="p-1 rounded text-gray-400 hover:text-red-500 hover:bg-[#fafafa]"
                          title="Delete Stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-xs text-[#9b9b9b]">No stocks in watchlist. Search for a ticker to begin.</div>
            )}
          </div>

          {/* Watchlist Footer statistics */}
          <div className="h-[36px] bg-[#fafafa] border-t border-[#eeeeee] flex justify-between items-center px-4 text-[11px] text-[#888888] shrink-0 font-medium font-mono">
            <span>Watchlist ({history.length} / 250)</span>
            <div className="flex gap-2">
              <span className="text-[#ff5722] font-bold">1</span>
              <span className="hover:text-[#ff5722] cursor-pointer">2</span>
              <span className="hover:text-[#ff5722] cursor-pointer">3</span>
            </div>
          </div>

        </aside>

        {/* Right Main Panel */}
        <main className="flex-1 bg-[#fcfcfc] overflow-y-auto relative p-6">
          
          {activeTab === "dashboard" ? (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
              
              {/* Greeting */}
              <div className="border-b border-[#eeeeee] pb-4">
                <h1 className="text-2xl font-normal text-[#444444] tracking-tight">Hi, Ayush</h1>
                <p className="text-xs text-[#9b9b9b] mt-0.5">Welcome back to your institutional Stock Research workspace.</p>
              </div>

              {/* Status Warning bar like Kite info boxes */}
              {status === "loading" && (
                <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md flex items-start gap-3">
                  <RefreshCw className="w-4 h-4 text-blue-500 animate-spin shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="font-semibold block text-[13px]">AI Research In Progress...</strong>
                    <span>Deploying LangGraph multi-agent orchestrator. Running Web searches, sentiment evaluations, and financial analyses. Wait around 20-40 seconds.</span>
                    <div className="pt-2">
                      <LoadingUI progressEvents={progressEvents} />
                    </div>
                  </div>
                </div>
              )}

              {status === "error" && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md flex items-start justify-between">
                  <div className="text-xs">
                    <strong className="font-semibold block text-[13px]">Research Pipeline Failed</strong>
                    <span>{errorMsg}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStatus("idle")} className="p-1 h-auto text-red-800 hover:bg-red-100">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Equities & Commodities Margins panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Equity Margin */}
                <div className="bg-white border border-[#e0e0e0] p-5 rounded-md flex justify-between">
                  <div className="space-y-4">
                    <div className="text-xs text-[#9b9b9b] font-semibold tracking-wide flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4 text-blue-500" /> EQUITY PORTFOLIO
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-light text-[#444444]">{history.length}</div>
                      <div className="text-[10px] text-[#9b9b9b] font-mono">Reports Saved</div>
                    </div>
                  </div>
                  <div className="text-xs text-right space-y-2 border-l border-[#eeeeee] pl-8 font-mono">
                    <div>
                      <span className="text-[#9b9b9b] block text-[10px]">INVEST RATING</span>
                      <span className="text-[#4caf50] font-bold text-sm">{investCount}</span>
                    </div>
                    <div>
                      <span className="text-[#9b9b9b] block text-[10px]">WATCHLIST RATING</span>
                      <span className="text-[#f59e0b] font-bold text-sm">{watchlistCount}</span>
                    </div>
                  </div>
                </div>

                {/* Commodity Margin */}
                <div className="bg-white border border-[#e0e0e0] p-5 rounded-md flex justify-between">
                  <div className="space-y-4">
                    <div className="text-xs text-[#9b9b9b] font-semibold tracking-wide flex items-center gap-1.5">
                      <History className="w-4 h-4 text-orange-500" /> PASS ARCHIVES
                    </div>
                    <div className="space-y-1">
                      <div className="text-3xl font-light text-[#444444]">{passCount}</div>
                      <div className="text-[10px] text-[#9b9b9b] font-mono">Avoid Recommendations</div>
                    </div>
                  </div>
                  <div className="text-xs text-right space-y-2 border-l border-[#eeeeee] pl-8 font-mono">
                    <div>
                      <span className="text-[#9b9b9b] block text-[10px]">TOTAL VALUE RESEARCHED</span>
                      <span className="text-[#3b82f6] font-bold text-sm">₹{totalInvestment.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[#9b9b9b] block text-[10px]">LATEST ACTIVITY</span>
                      <span className="text-[#444444] font-bold text-sm">{history[0]?.ticker || "None"}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Holdings portfolio card */}
              <div className="bg-white border border-[#e0e0e0] p-6 rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-xs tracking-wider text-[#9b9b9b] uppercase">Holdings Performance Profile</h3>
                  <div className="text-xs font-semibold text-[#387ed1] cursor-pointer hover:underline">View reports sheet</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-2">
                  <div className="space-y-1">
                    <span className="text-[#9b9b9b] text-[10px] uppercase font-mono block">Invested Valuation</span>
                    <span className="text-2xl font-light text-[#444444]">₹{(totalInvestment * 0.95).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9b9b9b] text-[10px] uppercase font-mono block">Current Valuation</span>
                    <span className="text-2xl font-light text-[#444444]">₹{totalInvestment.toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9b9b9b] text-[10px] uppercase font-mono block">Estimated Gains / Yield</span>
                    <span className="text-2xl font-normal text-[#4caf50]">+₹{(totalInvestment * 0.05).toLocaleString(undefined, {maximumFractionDigits:2})}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[#9b9b9b] text-[10px] uppercase font-mono block">Average Yield P&L</span>
                    <span className="text-2xl font-normal text-[#4caf50]">+5.26%</span>
                  </div>
                </div>

                {/* Color scale visual performance bar */}
                <div className="w-full bg-[#eeeeee] h-[10px] rounded-sm overflow-hidden flex mt-6">
                  <div className="bg-[#4caf50] h-full" style={{ width: `${(investCount / (history.length || 1)) * 100}%` }} title="Invest" />
                  <div className="bg-[#f59e0b] h-full" style={{ width: `${(watchlistCount / (history.length || 1)) * 100}%` }} title="Watchlist" />
                  <div className="bg-[#ef4444] h-full" style={{ width: `${(passCount / (history.length || 1)) * 100}%` }} title="Pass" />
                </div>
              </div>

              {/* Dashboard lists grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Searches */}
                <div className="bg-white border border-[#e0e0e0] p-4 rounded-md">
                  <h4 className="font-semibold text-xs text-[#9b9b9b] uppercase tracking-wider mb-3">Recently Researched</h4>
                  <div className="divide-y divide-[#eeeeee]">
                    {history.slice(0, 5).map((item) => (
                      <div 
                        key={item._id} 
                        onClick={() => loadPastReport(item.ticker)}
                        className="py-2.5 flex justify-between items-center text-xs hover:bg-[#fafafa] cursor-pointer px-2 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="font-bold">{item.ticker}</span>
                          <span className="text-[10px] text-gray-400 font-medium truncate max-w-[130px]">{item.companyResearch?.sector}</span>
                        </div>
                        <span className={`text-[10px] font-bold ${
                          item.finalDecision?.recommendation === "INVEST" ? "text-[#4caf50]" :
                          item.finalDecision?.recommendation === "WATCHLIST" ? "text-[#f59e0b]" :
                          "text-[#ff5722]"
                        }`}>{item.finalDecision?.recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* IPO / Economic Calendar Section like Kite */}
                <div className="bg-white border border-[#e0e0e0] p-4 rounded-md space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-xs text-[#9b9b9b] uppercase tracking-wider mb-2.5">Corporate Actions Calendar</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-[13px]">NTPC Green Energy IPO</span>
                          <span className="text-[10px] text-gray-400">IPO Open • Electric Utilities</span>
                        </div>
                        <Badge variant="outline" className="text-[9px] bg-green-50 text-green-600 border-green-200">APPLY NOW</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-bold block text-[13px]">RELIANCE Dividend AGM</span>
                          <span className="text-[10px] text-gray-400">Board Meeting • July 20, 2026</span>
                        </div>
                        <span className="text-[10px] text-[#ff5722] font-semibold">1:2 Ratio</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            reportData && <ReportDashboard data={reportData} />
          )}

        </main>

      </div>
    </div>
  );
}
