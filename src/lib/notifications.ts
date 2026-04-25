import mongoose from 'mongoose';
import Notification, { NotificationType } from '@/models/Notification';

interface NotificationPayload {
    type: NotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
}

export async function createNotification(
    userId: string | mongoose.Types.ObjectId,
    payload: NotificationPayload
) {
    return Notification.create({
        user_id: userId,
        ...payload,
    });
}

export async function createBadgeNotifications(
    userId: string | mongoose.Types.ObjectId,
    badgeNames: string[]
) {
    if (badgeNames.length === 0) return;

    await Notification.insertMany(
        badgeNames.map((badgeName) => ({
            user_id: userId,
            type: 'badge' as const,
            title: 'New Badge Unlocked',
            message: `You earned the "${badgeName}" badge. Keep going!`,
            metadata: { badgeName },
        }))
    );
}
