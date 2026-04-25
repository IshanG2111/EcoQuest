import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGameSession extends Document {
    user_id: mongoose.Types.ObjectId;
    game_slug: string;
    score: number;
    duration_secs: number;
    metadata?: Record<string, any>;
    played_at: Date;
}

const GameSessionSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        game_slug: { type: String, required: true },
        score: { type: Number, required: true },
        duration_secs: { type: Number, default: 0 },
        metadata: { type: Schema.Types.Mixed },
        played_at: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

const GameSession: Model<IGameSession> = mongoose.models.GameSession || mongoose.model<IGameSession>('GameSession', GameSessionSchema);

export default GameSession;
