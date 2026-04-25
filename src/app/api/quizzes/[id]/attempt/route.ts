import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import QuizAttempt from '@/models/QuizAttempt';
import User from '@/models/User';
import Badge from '@/models/Badge';
import Quiz from '@/models/Quiz';
import { z } from 'zod';
import mongoose from 'mongoose';

const AttemptSchema = z.object({
    score: z.number().int().min(0),
    max_score: z.number().int().min(1),
});

// POST /api/quizzes/[id]/attempt — save quiz result
export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: quiz_id } = await params;
    const body = await request.json();
    const parsed = AttemptSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    if (!mongoose.Types.ObjectId.isValid(quiz_id)) {
        return NextResponse.json({ error: 'Invalid Quiz ID' }, { status: 400 });
    }

    const { score, max_score } = parsed.data;

    await connectDB();

    try {
        const quiz = await Quiz.findById(quiz_id).lean();
        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Check if attempt already exists
        const existingAttempt = await QuizAttempt.findOne({
            user_id: session.user.id,
            quiz_id,
        }).lean();

        if (existingAttempt) {
            return NextResponse.json(
                { error: 'You have already completed this quiz.' },
                { status: 400 }
            );
        }

        // Insert attempt
        const attempt = await QuizAttempt.create({
            user_id: session.user.id,
            quiz_id,
            score,
            max_score,
        });

        // Award points based on percentage correct
        const percentage = score / max_score;
        const ecoPointsEarned = Math.round(quiz.points_value * percentage);

        if (ecoPointsEarned > 0) {
            const user = await User.findById(session.user.id);
            if (user) {
                const today = new Date().toISOString().split('T')[0];
                const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

                let newStreak = user.streak ?? 0;
                if (user.last_active === yesterday) newStreak += 1;
                else if (user.last_active !== today) newStreak = 1;

                user.points = (user.points ?? 0) + ecoPointsEarned;
                user.streak = newStreak;
                user.last_active = today;

                await user.save();

                // Check "Perfect Score" badge
                if (percentage === 1) {
                    const badge = await Badge.findOne({ name: 'Perfect Score' }).lean();
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
            message: 'Quiz submitted successfully',
            ecoPointsEarned,
            score,
            max_score,
        });
    } catch (error) {
        console.error('Quiz attempt error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
