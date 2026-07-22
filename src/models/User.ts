import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password_hash: string;
    display_name: string;
    avatar_url?: string;
    role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    points: number;
    streak: number;
    last_active: string;
    badges: { badge_id: mongoose.Types.ObjectId; earned_at: Date }[];
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema(
    {
        email: { type: String, required: true, unique: true, lowercase: true },
        password_hash: { type: String, required: true },
        display_name: { type: String, required: true },
        avatar_url: { type: String },
        role: { type: String, enum: ['USER', 'ADMIN', 'SUPER_ADMIN'], default: 'USER' },
        points: { type: Number, default: 0 },
        streak: { type: Number, default: 0 },
        last_active: { type: String, default: () => new Date().toISOString().split('T')[0] },
        badges: [
            {
                badge_id: { type: Schema.Types.ObjectId, ref: 'Badge' },
                earned_at: { type: Date, default: Date.now },
            },
        ],
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
