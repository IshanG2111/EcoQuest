import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Quiz from '@/models/Quiz';
import mongoose from 'mongoose';

// GET /api/quizzes/[id] — fetch quiz + questions
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const role = (session.user as any).role;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid Quiz ID' }, { status: 400 });
    }

    await connectDB();

    try {
        const quiz = await Quiz.findById(id).lean();

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        // Students can only access published quizzes
        if (!quiz.is_published && role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Sort questions by order
        const sortedQuestions = [...(quiz.quiz_questions as any[])].sort(
            (a, b) => a.question_order - b.question_order
        );

        // Format to match old output if necessary
        const formattedQuiz = {
            id: quiz._id.toString(),
            title: quiz.title,
            topic: quiz.topic,
            difficulty: quiz.difficulty,
            description: quiz.description,
            learning_material: quiz.learning_material,
            points_value: quiz.points_value,
            is_published: quiz.is_published,
            quiz_questions: sortedQuestions.map(q => ({
                id: q._id.toString(),
                question_text: q.question_text,
                options: q.options,
                correct_index: q.correct_index,
                explanation: q.explanation,
                question_order: q.question_order
            }))
        };

        return NextResponse.json(formattedQuiz);
    } catch (error) {
        console.error('Fetch quiz error:', error);
        return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 });
    }
}

// DELETE /api/quizzes/[id] — teachers/admins only
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: 'Invalid Quiz ID' }, { status: 400 });
    }

    await connectDB();

    try {
        const result = await Quiz.findByIdAndDelete(id);

        if (!result) {
            return NextResponse.json({ error: 'Failed to delete quiz or quiz not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Quiz deleted' });
    } catch (error) {
        console.error('Delete quiz error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
