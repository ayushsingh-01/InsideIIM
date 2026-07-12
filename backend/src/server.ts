import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { researchGraph } from './agents/orchestrator';
import { Research } from './models/Research';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
let isDbConnected = false;
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/investai';
mongoose.connect(mongoUri)
  .then(() => {
    console.log('Successfully connected to MongoDB');
    isDbConnected = true;
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB, running in offline/no-cache fallback mode:', err.message);
  });

// GET: past research history
app.get('/api/research/history', async (req, res) => {
  try {
    if (!isDbConnected) {
      return res.json([]);
    }
    const history = await Research.find({}, 'ticker companyResearch finalDecision createdAt')
      .sort({ createdAt: -1 });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET: individual report details
app.get('/api/research/report/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    if (!isDbConnected) {
      return res.status(404).json({ error: "Database not connected. Offline mode." });
    }
    const report = await Research.findOne({ ticker: ticker.toUpperCase() });
    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE: remove a report from database
app.delete('/api/research/report/:ticker', async (req, res) => {
  try {
    const { ticker } = req.params;
    if (!isDbConnected) {
      return res.status(400).json({ error: "Database not connected. Offline mode." });
    }
    const result = await Research.deleteOne({ ticker: ticker.toUpperCase() });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Report not found" });
    }
    res.json({ success: true, message: "Successfully deleted report" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET: SSE stream for running research
app.get('/api/research/stream', async (req, res) => {
  const { ticker } = req.query;

  if (!ticker || typeof ticker !== 'string') {
    return res.status(400).json({ error: "Ticker is required" });
  }

  const tickerUpper = ticker.toUpperCase();

  // Set headers for Server-Sent Events (SSE)
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Establish the connection immediately

  // Helper to send JSON messages
  const sendSSE = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const initialState = { ticker: tickerUpper, messages: [] };
    const eventStream = await researchGraph.stream(initialState);

    let finalOutput: any = { ticker: tickerUpper };

    for await (const chunk of eventStream) {
      const nodeName = Object.keys(chunk)[0];
      const nodeOutput = (chunk as any)[nodeName];

      if (nodeOutput.messages && nodeOutput.messages.length > 0) {
        const msg = nodeOutput.messages[nodeOutput.messages.length - 1];
        sendSSE({
          type: "progress",
          agent: nodeName,
          message: msg
        });
      }

      // Accumulate final output
      finalOutput = { ...finalOutput, ...nodeOutput };
    }

    // Attempt to save to MongoDB
    if (isDbConnected && finalOutput.finalDecision) {
      try {
        await Research.findOneAndUpdate(
          { ticker: tickerUpper },
          { ...finalOutput, createdAt: new Date() },
          { upsert: true, new: true }
        );
        console.log(`Saved research report for ${tickerUpper}`);
      } catch (dbErr: any) {
        console.error(`Failed to save report to database:`, dbErr.message);
      }
    }

    // Stream finished event with data
    sendSSE({ type: "done", data: finalOutput });
    res.end();
  } catch (error: any) {
    console.error(`Error in research stream for ${tickerUpper}:`, error);
    sendSSE({ type: "error", message: error.message || "An error occurred during agent research." });
    res.end();
  }
});

app.listen(PORT, () => {
  console.log(`InvestAI MERN Server running on port ${PORT}`);
});
