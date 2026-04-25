import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET /api/leaderboard?limit=10
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10', 10), 50);

    await connectDB();

    try {
        // Aggregate to get top N users sorted by points
        const leaderboard = await User.aggregate([
            { $match: { role: 'user' } },
            { $sort: { points: -1 } },
            { $limit: limit },
            {
                $project: {
                    user_id: '$_id',
                    display_name: 1,
                    avatar_url: 1,
                    total_points: '$points',
                }
            }
        ]);

        // Add rank manually since $setWindowFields is only available in MongoDB 5.0+ and we might want a simpler approach
        const rankedLeaderboard = leaderboard.map((user, index) => ({
            ...user,
            user_id: user.user_id.toString(),
            rank: index + 1
        }));

        // Get current user's rank
        // We can do this by counting how many students have strictly more points
        const currentUser = await User.findById(session.user.id).select('points display_name avatar_url role').lean();
        
        let myRankData = null;

        if (currentUser && currentUser.role === 'user') {
            const usersWithMorePoints = await User.countDocuments({
                role: 'user',
                points: { $gt: currentUser.points }
            });

            myRankData = {
                user_id: currentUser._id.toString(),
                display_name: currentUser.display_name,
                avatar_url: currentUser.avatar_url,
                total_points: currentUser.points,
                rank: usersWithMorePoints + 1
            };
        }

        return NextResponse.json({
            leaderboard: rankedLeaderboard,
            currentUser: myRankData,
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
