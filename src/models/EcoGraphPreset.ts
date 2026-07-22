import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IEcoGraphPreset extends Document {
  key: string;
  repulsion: number;
  linkDist: number;
  centerForce: number;
  friction: number;
  nodeSize: number;
  lineOpacity: number;
  categoryColors: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const EcoGraphPresetSchema: Schema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'global_presets' },
    repulsion: { type: Number, default: 1100 },
    linkDist: { type: Number, default: 85 },
    centerForce: { type: Number, default: 0.005 },
    friction: { type: Number, default: 0.955 },
    nodeSize: { type: Number, default: 1.2 },
    lineOpacity: { type: Number, default: 0.35 },
    categoryColors: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const EcoGraphPreset: Model<IEcoGraphPreset> =
  mongoose.models.EcoGraphPreset || mongoose.model<IEcoGraphPreset>('EcoGraphPreset', EcoGraphPresetSchema);

export default EcoGraphPreset;
