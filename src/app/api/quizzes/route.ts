import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import User from '@/models/User';
import { z } from 'zod';

// GET /api/quizzes?topic=&difficulty=&published=true
export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const difficulty = searchParams.get('difficulty');

    await connectDB();

    const query: any = {};

    if (topic) query.topic = { $regex: new RegExp(topic, 'i') };
    if (difficulty) query.difficulty = difficulty;

    try {
        const quizzes = await Quiz.find(query)
            .select('-quiz_questions') // Omit questions for listing
            .sort({ createdAt: -1 })
            .populate('created_by', 'display_name')
            .lean();

        // Format to match old output if necessary
        const formattedQuizzes = quizzes.map((q: any) => ({
            id: q._id.toString(),
            title: q.title,
            topic: q.topic,
            difficulty: q.difficulty,
            description: q.description,
            points_value: q.points_value,
            is_published: q.is_published,
            created_at: q.createdAt,
            users: { display_name: q.created_by?.display_name || 'Unknown' }
        }));

        return NextResponse.json({ quizzes: formattedQuizzes });
    } catch (error) {
        console.error('Fetch quizzes error:', error);
        return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
    }
}

const CreateQuizSchema = z.object({
    title: z.string().min(3).max(100),
    topic: z.string().min(2),
    difficulty: z.enum(['easy', 'medium', 'hard']),
    description: z.string().optional(),
    points_value: z.number().int().min(10).max(1000).optional().default(100),
    is_published: z.boolean().optional().default(false),
    questions: z
        .array(
            z.object({
                question_text: z.string().min(5),
                options: z.array(z.string()).length(4),
                correct_index: z.number().int().min(0).max(3),
                explanation: z.string().optional(),
            })
        )
        .min(1)
        .max(30),
});

// POST /api/quizzes — Disabled (admins/roles removed)
export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
