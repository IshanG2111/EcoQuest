import mongoose, { Schema, Document } from 'mongoose';

export interface IEcoFact extends Document {
  fact: string;
  explanation: string;
  tip: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  active: boolean;
  created_at: Date;
}

const EcoFactSchema: Schema = new Schema({
  fact: { type: String, required: true },
  explanation: { type: String, required: true },
  tip: { type: String, required: true },
  category: { type: String, required: true, index: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
  active: { type: Boolean, default: true },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.models.EcoFact || mongoose.model<IEcoFact>('EcoFact', EcoFactSchema);
