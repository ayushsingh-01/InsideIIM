import mongoose, { Schema } from 'mongoose';

const ResearchSchema = new Schema({
  ticker: { type: String, required: true, unique: true },
  companyResearch: { type: Schema.Types.Mixed },
  marketData: { type: Schema.Types.Mixed },
  financialAnalysis: { type: Schema.Types.Mixed },
  technicalAnalysis: { type: Schema.Types.Mixed },
  newsAnalysis: { type: Schema.Types.Mixed },
  macroAnalysis: { type: Schema.Types.Mixed },
  valuationAnalysis: { type: Schema.Types.Mixed },
  riskAnalysis: { type: Schema.Types.Mixed },
  finalDecision: { type: Schema.Types.Mixed },
  messages: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export const Research = mongoose.models.Research || mongoose.model('Research', ResearchSchema);
