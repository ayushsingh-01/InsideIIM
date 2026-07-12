import React, { useState, useEffect } from "react";
import { Search, TrendingUp, Sparkles, History, Clock, ArrowRight, Trash2 } from "lucide-react";
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
          setStatus("idle");
          setReportData(null);
        }
      } else {
        alert("Failed to delete the report.");
      }
    } catch (err) {
      console.error("Error deleting report:", err);
      alert("An error occurred while deleting the report.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#444444] relative overflow-hidden font-sans pb-24">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="border-b border-[#e0e0e0] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter cursor-pointer" onClick={() => setStatus("idle")}>
            <TrendingUp className="w-6 h-6 text-[#ff5722]" />
            <span>Invest<span className="text-[#ff5722]">AI</span></span>
          </div>
          {status !== "idle" && (
            <Button variant="ghost" size="sm" onClick={() => setStatus("idle")} className="text-[#ff5722] hover:bg-orange-50 font-semibold cursor-pointer">
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-100 text-sm mb-6 text-[#ff5722] font-semibold">
                <Sparkles className="w-4 h-4" /> Powered by LangGraph & Gemini 3.1 Flash-Lite
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-[#444444]">
                Institutional-Grade <br/> AI Investment Research.
              </h1>
              <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-2xl">
                Type a ticker to deploy an orchestration of 9 AI agents that gather financials, analyze technicals, gauge news sentiment, and compute intrinsic value in real-time.
              </p>

              <form onSubmit={handleSearchSubmit} className="w-full max-w-xl flex items-center gap-2 bg-white p-2 rounded-full border border-[#cccccc] shadow-lg focus-within:border-[#ff5722] transition-colors">
                <div className="pl-4 text-gray-400"><Search className="w-5 h-5" /></div>
                <Input 
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Enter NSE/BSE Ticker (e.g. RELIANCE.NS)"
                  className="flex-1 bg-white border-none text-lg focus-visible:ring-0 focus-visible:ring-offset-0 px-2 text-[#444444]"
                />
                <Button type="submit" size="lg" className="rounded-full bg-[#ff5722] hover:bg-[#e04f26] text-white font-semibold px-8 cursor-pointer border-none">
                  Analyze
                </Button>
              </form>

              <div className="mt-8 flex gap-4 text-sm text-gray-500">
                Try: 
                <button onClick={() => { setTicker("RELIANCE.NS"); startResearch("RELIANCE.NS"); }} className="text-[#387ed1] hover:text-[#ff5722] transition-colors border-b border-dashed border-[#387ed1]/50">RELIANCE.NS</button>
                <button onClick={() => { setTicker("TCS.NS"); startResearch("TCS.NS"); }} className="text-[#387ed1] hover:text-[#ff5722] transition-colors border-b border-dashed border-[#387ed1]/50">TCS.NS</button>
                <button onClick={() => { setTicker("INFY.NS"); startResearch("INFY.NS"); }} className="text-[#387ed1] hover:text-[#ff5722] transition-colors border-b border-dashed border-[#387ed1]/50">INFY.NS</button>
              </div>
            </div>

            {/* History Section */}
            {history.length > 0 && (
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center gap-2 text-xl font-bold border-b border-[#e0e0e0] pb-3 text-[#444444]">
                  <History className="w-5 h-5 text-[#ff5722]" />
                  <h2>Past Researches</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.map((item) => {
                    const rec = item.finalDecision?.recommendation;
                    const badgeColor = 
                      rec === 'INVEST' ? 'bg-green-50 text-green-700 border-green-200' :
                      rec === 'WATCHLIST' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200';

                    return (
                      <div 
                        key={item._id}
                        onClick={() => loadPastReport(item.ticker)}
                        className="p-5 rounded-xl border border-[#e0e0e0] bg-white hover:bg-orange-50/20 hover:border-[#ff5722]/50 transition-all cursor-pointer flex justify-between items-center group shadow-sm"
                      >
                        <div className="space-y-1">
                          <div className="font-sans text-lg font-bold flex items-center gap-2 text-[#444444]">
                            <span>{item.ticker}</span>
                            {rec && (
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${badgeColor}`}>
                                {rec}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.companyResearch?.industry || "Unknown Industry"}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-[#387ed1] hover:text-[#ff5722] text-sm opacity-70 group-hover:opacity-100 transition-opacity">
                            <span>View Report</span>
                            <ArrowRight className="w-4 h-4" />
                          </div>
                          <button
                            onClick={(e) => handleDeleteReport(e, item.ticker)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
          <div className="text-center mt-20 text-red-700 bg-red-50 p-6 rounded-lg max-w-xl mx-auto border border-red-200">
            <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
            <p>{errorMsg}</p>
            <Button className="mt-6 cursor-pointer bg-[#ff5722] hover:bg-[#e04f26] text-white font-semibold rounded-full px-6 border-none" onClick={() => setStatus("idle")}>Try Again</Button>
          </div>
        )}

        {status === "complete" && reportData && (
          <ReportDashboard data={reportData} />
        )}

      </div>
    </div>
  );
}
