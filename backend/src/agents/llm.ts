import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

// Shared LLM instance for all agents
export const getLLM = () => {
  return new ChatGoogleGenerativeAI({
    model: "gemini-3.1-flash-lite",
    temperature: 0, // Deterministic output for analytical tasks
    apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GOOGLE_API_KEY,
  });
};
