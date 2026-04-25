import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IBadge extends Document {
    name: string;
    icon_key: string;
    description: string;
}

const BadgeSchema: Schema = new Schema(
    {
        name: { type: String, required: true, unique: true },
        icon_key: { type: String, required: true },
        description: { type: String, required: true },
    },
    { timestamps: true }
);

const Badge: Model<IBadge> = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);

export default Badge;
