import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import GameSession from '@/models/GameSession';
import QuizAttempt from '@/models/QuizAttempt';
import Notification from '@/models/Notification';

const { auth } = NextAuth(authConfig);

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectDB();

    // ── Cascade delete ALL user-associated data (GDPR-compliant) ─────────
    await Promise.all([
      User.findByIdAndDelete(userId),
      // Delete all game sessions
      GameSession.deleteMany({ userId }),
      // Delete all quiz attempts
      QuizAttempt.deleteMany({ userId }),
      // Delete all notifications
      Notification.deleteMany({ userId }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data permanently deleted.',
    });
  } catch (error: any) {
    console.error('[Delete Account]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account.' }, { status: 500 });
  }
}
