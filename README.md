# InvestAI — Institutional Stock Research Agent

InvestAI is an institutional-grade stock analysis dashboard that deploys an orchestration of **9 specialized AI agents** to research any stock ticker in real-time, compile data, and output an investment thesis with SWOT analysis and final trade recommendation.

---

## Overview

InvestAI automates equity research by querying multi-perspective stock data and using LLM reasoning to form a consensus. 
* **Real-time Agents Checklist**: Streams the node execution live via Server-Sent Events (SSE).
* **Consensus-based Decisioning**: Orchestrated workflow ending in a Chief Investment Officer decision (`INVEST`, `WATCHLIST`, or `PASS`) with confidence scores.
* **Interactive Charting**: Visualizes 30-day historical prices using Recharts.
* **Research Persistence**: Saves past research in MongoDB, allowing instant loading of previous reports.

---

## How to Run It

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **MongoDB** installed (either running locally or an Atlas URI).

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
GOOGLE_GENAI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key

# Optional: MongoDB connection (defaults to local if omitted)
MONGODB_URI=mongodb://127.0.0.1:27017/investai
```

### 3. Install Workspace Dependencies
From the root directory, run the helper command to install dependencies for the root, backend, and frontend concurrently:
```bash
npm run install-all
```

### 4. Run the Dev Servers
Start both the Express backend (`port 5001`) and Vite frontend (`port 3000`) concurrently:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## How It Works

InvestAI is built on a **MERN Stack** (MongoDB, Express, React, Node) architecture running on Vite:

```
┌─────────────────────────────────────────────────────────┐
│                    Vite React Client                    │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP / SSE (Port 3000)
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  Express Server API                     │
└────────────────────────────┬────────────────────────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
┌───────────────────────┐           ┌───────────────────┐
│        MongoDB        │           │  LangGraph Node   │
│  (Mongoose Schema)    │           │   Orchestrator    │
└───────────────────────┘           └─────────┬─────────┘
                                              │
                       ┌──────────────────────┼──────────────────────┐
                       ▼                      ▼                      ▼
             ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
             │  Yahoo Finance   │   │   Tavily Search  │   │  Gemini 3.1 LLM  │
             │   (Market Data)  │   │    (News/Macro)  │   │   (Agent Nodes)  │
             └──────────────────┘   └──────────────────┘   └──────────────────┘
```

### Agent Orchestration Flow (LangGraph State Graph)
Each node executes sequentially and appends findings to the shared graph state:
1. **Agent 1: Company Research**: Gathers profile, sector, business model, and competitors (Tavily search grounding + Gemini structured output).
2. **Agent 2: Market Data**: Fetches 52W high/low, current price, volume, and 30-day historical chart data (Yahoo Finance API).
3. **Agent 3: Financial Analysis**: Analyzes submodules like revenue growth, profitability growth, and P/E ratios to compute a financial score.
4. **Agent 4: Technical Analysis**: Calculates technical indicators (SMA 50, SMA 200, MACD, RSI) to determine the price trend (Bullish/Bearish).
5. **Agent 5: News Sentiment**: Scours recent news reports to score market sentiment (Positive/Negative/Neutral).
6. **Agent 6: Macro Factors**: Identifies business risks and macroeconomic headwinds affecting the industry.
7. **Agent 7: Valuation**: Uses relative multiples and valuation metrics to determine intrinsic value status (Undervalued/Fair/Overvalued).
8. **Agent 8: Risk Assessment**: Compiles corporate governance, economic, and industry risks into a final risk percentage.
9. **Agent 9: Chief Decision Officer**: Aggregates all previous findings, performs a SWOT analysis, and makes the final recommendation.

---

## Key Decisions & Trade-offs

* **Decoupled Express + Vite SPA instead of Next.js**: Migrated from Next.js to React + Vite. This isolates browser code from Node.js dependencies, resolves package versioning conflicts with third-party libraries (like LangChain and Yahoo Finance), avoids Turbopack compiler bugs, and yields an ultra-fast client-side single page app.
* **Server-Sent Events (SSE) for Real-Time Streaming**: Standard SSE GET requests were chosen over WebSockets because research is unidirectional (server-to-client progress streaming). It is lighter, native to browsers, and easier to scale.
* **MongoDB Mongoose Schema Caching**: Rather than calling LLM and Search APIs repeatedly (which incurs latency and token costs), completed reports are cached. Users can load previous reports instantly from the dashboard homepage.
* **Offline Fallback Database Mode**: If MongoDB is offline, the backend continues in "fallback mode" rather than crashing, executing and streaming requests without saving.

---

## Example Runs

### 1. TCS.NS (Tata Consultancy Services)
* **Recommendation**: `WATCHLIST` (75% confidence)
* **Rationale**: Stable free cash flows, industry-leading operating margins, and high ROE. Watchlist recommendation is due to slow-moving macroeconomic IT spending constraints and geopolitical changes affecting overseas contracts.
* **SWOT Highlights**:
  * *Strengths*: Strong institutional backing, robust balance sheet, client stickiness.
  * *Weaknesses*: Premium valuation relative to historical growth.

### 2. RELIANCE.NS (Reliance Industries Ltd)
* **Recommendation**: `INVEST` (85% confidence)
* **Rationale**: Large conglomerate with dominant market positions in energy, retail, and telecommunications. Robust consumer-facing growth (Jio and Retail) offsetting slower margins in petrochemicals.
* **SWOT Highlights**:
  * *Strengths*: Highly diversified revenue streams, high barrier to entry.
  * *Threats*: Regulatory changes in telecommunication tariffs and import duties.

---

## What to Improve with More Time

1. **Parallel Node Execution**: Currently, the graph runs sequentially. Agents like Market Data, News Sentiment, and Macro Factors do not depend on each other and could be run in parallel, reducing latency from ~10s to ~3s.
2. **Advanced Financial Calculations**: Incorporate real Discounted Cash Flow (DCF) calculators by pulling full balance sheets and cash flow statement arrays from the financial APIs.
3. **Conversational Interface**: Implement an interactive chat box next to the dashboard, allowing users to converse with the agents directly (e.g., *"Why did the news sentiment score decrease?"*).
4. **User Portfolios**: Add user authentication (JWT) to allow analysts to save portfolios and set alert metrics for automated re-evaluations.
