import mongoose, { Document, Model, Schema } from 'mongoose';

export type NotificationType = 'badge' | 'game' | 'quiz' | 'progress' | 'system';

export interface INotification extends Document {
    user_id: mongoose.Types.ObjectId;
    type: NotificationType;
    title: string;
    message: string;
    is_read: boolean;
    metadata?: Record<string, unknown>;
    created_at: Date;
}

const NotificationSchema: Schema = new Schema(
    {
        user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        type: {
            type: String,
            enum: ['badge', 'game', 'quiz', 'progress', 'system'],
            default: 'system',
            required: true,
        },
        title: { type: String, required: true, trim: true, maxlength: 120 },
        message: { type: String, required: true, trim: true, maxlength: 500 },
        is_read: { type: Boolean, default: false, index: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
        created_at: { type: Date, default: Date.now, index: true },
    },
    { timestamps: true }
);

NotificationSchema.index({ user_id: 1, created_at: -1 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
