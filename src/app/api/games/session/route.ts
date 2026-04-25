import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import GameSession from '@/models/GameSession';
import User from '@/models/User';
import Badge from '@/models/Badge';
import { z } from 'zod';

const GameSessionSchema = z.object({
    game_slug: z.string().min(1).max(50),
    score: z.number().int().min(0),
    duration_secs: z.number().int().min(0).optional().default(0),
    metadata: z.record(z.unknown()).optional().default({}),
});

// POST /api/games/session — save a completed game score
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = GameSessionSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { game_slug, score, duration_secs, metadata } = parsed.data;

    await connectDB();

    try {
        // Save game session
        const gameSession = await GameSession.create({
            user_id: session.user.id,
            game_slug,
            score,
            duration_secs,
            metadata,
        });

        // Convert game score to Eco Points (1 game point = 1 eco point, max 200 per session)
        const ecoPointsToAdd = Math.min(score, 200);

        if (ecoPointsToAdd > 0) {
            const user = await User.findById(session.user.id);
            if (user) {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                
                let newStreak = user.streak ?? 0;
                if (user.last_active === yesterday) newStreak += 1;
                else if (user.last_active !== today) newStreak = 1;

                user.points = (user.points ?? 0) + ecoPointsToAdd;
                user.streak = newStreak;
                user.last_active = today;

                await user.save();

                // Check: have they played all 5 games? Award "Game Master" badge
                const playedGames = await GameSession.distinct('game_slug', { user_id: session.user.id });
                const uniqueGames = new Set(playedGames);
                const allGameSlugs = ['forest-guardian', 'ocean-explorer', 'eco-city-builder', 'recycle-rally', 'carbon-quest'];

                if (allGameSlugs.every((slug) => uniqueGames.has(slug))) {
                    const badge = await Badge.findOne({ name: 'Game Master' }).lean();
                    if (badge) {
                        const hasBadge = user.badges.some((b: any) => b.badge_id.toString() === badge._id.toString());
                        if (!hasBadge) {
                            user.badges.push({ badge_id: badge._id, earned_at: new Date() });
                            await user.save();
                        }
                    }
                }
            }
        }

        return NextResponse.json({
            sessionId: gameSession._id.toString(),
            ecoPointsEarned: ecoPointsToAdd,
            message: `Game saved! +${ecoPointsToAdd} Eco Points`,
        });
    } catch (error) {
        console.error('Game session error:', error);
        return NextResponse.json({ error: 'Failed to save game session' }, { status: 500 });
    }
}
