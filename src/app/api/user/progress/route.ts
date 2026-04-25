import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { evaluateAndAwardBadges } from '@/lib/badges';
import { createBadgeNotifications, createNotification } from '@/lib/notifications';

// GET /api/user/progress — returns current user's progress + badges
export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    await connectDB();

    const user = await User.findById(userId).populate('badges.badge_id').lean();

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const badges = user.badges?.map((ub: any) => ({
        id: ub.badge_id._id.toString(),
        name: ub.badge_id.name,
        icon_key: ub.badge_id.icon_key,
        description: ub.badge_id.description,
        earned_at: ub.earned_at,
    })) ?? [];

    return NextResponse.json({
        points: user.points ?? 0,
        streak: user.streak ?? 0,
        last_active: user.last_active ?? null,
        badges,
    });
}

// PATCH /api/user/progress — add points, update streak
export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { pointsToAdd = 0, resetStreak = false } = body;

    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActive = user.last_active;
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let newStreak = user.streak ?? 0;
    if (resetStreak) {
        newStreak = 0;
    } else if (lastActive === yesterday) {
        newStreak = newStreak + 1; // continuing streak
    } else if (lastActive !== today) {
        newStreak = 1; // streak broken, restart
    }

    user.points = (user.points ?? 0) + pointsToAdd;
    user.streak = newStreak;
    user.last_active = today;

    await user.save();

    const awardedBadges = await evaluateAndAwardBadges(userId);

    if (pointsToAdd > 0) {
        await createNotification(userId, {
            type: 'progress',
            title: 'Eco Points Updated',
            message: `You gained ${pointsToAdd} Eco Points. Total: ${user.points}.`,
            metadata: { pointsToAdd, totalPoints: user.points },
        });
    }

    if (awardedBadges.length > 0) {
        await createBadgeNotifications(
            userId,
            awardedBadges.map((badge) => badge.name)
        );
    }

    return NextResponse.json({
        points: user.points,
        streak: user.streak,
        last_active: user.last_active,
        awardedBadges,
    });
}
