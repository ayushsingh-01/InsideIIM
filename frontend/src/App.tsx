import React, { useState, useEffect } from "react";
import { Search, TrendingUp, Sparkles, History, Clock, FileText, ArrowRight } from "lucide-react";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
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
}

const API_URL = import.meta.env.VITE_API_URL || "";

export default function App() {
  const [ticker, setTicker] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "complete" | "error">("idle");
  const [progressEvents, setProgressEvents] = useState<{ agent: string, message: string }[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState<PastResearch[]>([]);

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
          eventSource.close();
          fetchHistory(); // Refresh history list after a successful new research
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
      setErrorMsg("Connection to research stream failed. Ensure your server is running and .env is set up.");
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
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Could not retrieve report.");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden font-sans pb-24">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer" onClick={() => setStatus("idle")}>
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <span>Invest<span className="text-blue-500">AI</span></span>
          </div>
          {status !== "idle" && (
            <Button variant="ghost" size="sm" onClick={() => setStatus("idle")}>
              New Search
            </Button>
          )}
        </div>
      </header>

      <div className="py-12 px-4 max-w-7xl mx-auto z-10 relative">
        
        {status === "idle" && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero Section */}
            <div className="flex flex-col items-center justify-center text-center pt-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm mb-6 text-blue-300">
                <Sparkles className="w-4 h-4" /> Powered by LangGraph & Gemini 3.1 Flash-Lite
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-600 bg-clip-text text-transparent">
                Institutional-Grade <br/> AI Investment Research.
              </h1>
              <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl">
                Type a ticker to deploy an orchestration of 9 AI agents that gather financials, analyze technicals, gauge news sentiment, and compute intrinsic value in real-time.
              </p>

              <form onSubmit={handleSearchSubmit} className="w-full max-w-xl flex items-center gap-2 bg-white/5 p-2 rounded-full border border-white/10 shadow-2xl backdrop-blur-md focus-within:border-blue-500/50 transition-colors">
                <div className="pl-4 text-gray-400"><Search className="w-5 h-5" /></div>
                <Input 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Enter NSE/BSE Ticker (e.g. RELIANCE.NS)"
                  className="flex-1 bg-transparent border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-2"
                />
                <Button type="submit" size="lg" className="rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 cursor-pointer">
                  Analyze
                </Button>
              </form>

              <div className="mt-8 flex gap-4 text-sm text-gray-500">
                Try: 
                <button onClick={() => { setTicker("RELIANCE.NS"); startResearch("RELIANCE.NS"); }} className="hover:text-white transition-colors border-b border-dashed border-gray-600">RELIANCE.NS</button>
                <button onClick={() => { setTicker("TCS.NS"); startResearch("TCS.NS"); }} className="hover:text-white transition-colors border-b border-dashed border-gray-600">TCS.NS</button>
                <button onClick={() => { setTicker("INFY.NS"); startResearch("INFY.NS"); }} className="hover:text-white transition-colors border-b border-dashed border-gray-600">INFY.NS</button>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold border-b border-white/10 pb-3">
                  <History className="w-5 h-5 text-blue-500" />
                  <h2>Past Researches</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => {
                    const rec = item.finalDecision?.recommendation;
                    const badgeColor = 
                      rec === 'INVEST' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      rec === 'WATCHLIST' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                      'bg-red-500/10 text-red-400 border-red-500/20';

                    return (
                      <div 
                        key={item._id}
                        onClick={() => loadPastReport(item.ticker)}
                        className="p-5 rounded-xl border border-white/5 bg-white/2 backdrop-blur-sm hover:bg-white/5 hover:border-white/15 transition-all cursor-pointer flex justify-between items-center group"
                      >
                        <div className="space-y-1">
                          <div className="font-mono text-lg font-bold flex items-center gap-2">
                            <span>{item.ticker}</span>
                            {rec && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                                {rec}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {item.companyResearch?.industry || "Unknown Industry"}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-blue-400 text-sm opacity-60 group-hover:opacity-100 transition-opacity">
                          <span>View Report</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {status === "loading" && (
          <LoadingUI progressEvents={progressEvents} />
        )}

        {status === "error" && (
          <div className="text-center mt-20 text-red-500 bg-red-500/10 p-6 rounded-lg max-w-xl mx-auto border border-red-500/20">
            <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
            <p>{errorMsg}</p>
            <Button className="mt-6 cursor-pointer" onClick={() => setStatus("idle")}>Try Again</Button>
          </div>
        )}

        {status === "complete" && reportData && (
          <ReportDashboard data={reportData} />
        )}

      </div>
    </div>
  );
}
