import mongoose, { Document, Model, Schema } from 'mongoose';
import { NodeCategory, NodeLabel } from '@/lib/ecograph/types';

export interface IEcoGraphNode extends Document {
  id: string;
  label: NodeLabel;
  category: NodeCategory;
  name: string;
  scientificName?: string;
  description: string;
  attributes: Record<string, any>;
  provenance: {
    source: string;
    license?: string;
    confidenceScore: number;
    lastUpdated: string;
  };
  tags: string[];
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EcoGraphNodeSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true },
    category: { type: String, required: true, index: true },
    name: { type: String, required: true },
    scientificName: { type: String },
    description: { type: String, required: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    provenance: {
      source: { type: String, required: true },
      license: { type: String },
      confidenceScore: { type: Number, default: 1.0 },
      lastUpdated: { type: String },
    },
    tags: [{ type: String }],
    icon: { type: String },
  },
  { timestamps: true }
);

const EcoGraphNode: Model<IEcoGraphNode> =
  mongoose.models.EcoGraphNode || mongoose.model<IEcoGraphNode>('EcoGraphNode', EcoGraphNodeSchema);

export default EcoGraphNode;
