import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Notification from '@/models/Notification';
import mongoose from 'mongoose';

// GET /api/user/notifications?limit=10&unreadOnly=true
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50);
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    await connectDB();

    try {
        const filter: Record<string, unknown> = { user_id: session.user.id };
        if (unreadOnly) {
            filter.is_read = false;
        }

        const notifications = await Notification.find(filter)
            .sort({ created_at: -1 })
            .limit(limit)
            .lean();

        const unreadCount = await Notification.countDocuments({
            user_id: session.user.id,
            is_read: false,
        });

        return NextResponse.json({
            notifications: notifications.map((notification: any) => ({
                id: notification._id.toString(),
                type: notification.type,
                title: notification.title,
                message: notification.message,
                is_read: notification.is_read,
                metadata: notification.metadata ?? {},
                created_at: notification.created_at,
            })),
            unreadCount,
        });
    } catch (error) {
        console.error('Notifications fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
}

// PATCH /api/user/notifications { notificationId?: string, markAll?: boolean }
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, markAll = false } = body;

    await connectDB();

    try {
        if (markAll) {
            const result = await Notification.updateMany(
                { user_id: session.user.id, is_read: false },
                { $set: { is_read: true } }
            );

            return NextResponse.json({
                updated: result.modifiedCount,
                message: 'All notifications marked as read',
            });
        }

        if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
            return NextResponse.json({ error: 'Valid notificationId is required' }, { status: 400 });
        }

        const notification = await Notification.findOneAndUpdate(
            { _id: notificationId, user_id: session.user.id },
            { $set: { is_read: true } },
            { new: true }
        ).lean();

        if (!notification) {
            return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: notification._id.toString(),
            is_read: notification.is_read,
            message: 'Notification marked as read',
        });
    } catch (error) {
        console.error('Notifications update error:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
