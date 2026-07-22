import mongoose, { Document, Model, Schema } from 'mongoose';
import { EdgeType } from '@/lib/ecograph/types';

export interface IEcoGraphEdge extends Document {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  label: string;
  weight: number;
  provenance: {
    source: string;
    license?: string;
    confidenceScore: number;
    lastUpdated: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EcoGraphEdgeSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    sourceId: { type: String, required: true, index: true },
    targetId: { type: String, required: true, index: true },
    type: { type: String, required: true },
    label: { type: String, required: true },
    weight: { type: Number, default: 1.0 },
    provenance: {
      source: { type: String, required: true },
      license: { type: String },
      confidenceScore: { type: Number, default: 1.0 },
      lastUpdated: { type: String },
    },
  },
  { timestamps: true }
);

const EcoGraphEdge: Model<IEcoGraphEdge> =
  mongoose.models.EcoGraphEdge || mongoose.model<IEcoGraphEdge>('EcoGraphEdge', EcoGraphEdgeSchema);

export default EcoGraphEdge;
