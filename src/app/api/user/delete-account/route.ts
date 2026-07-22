import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

const { auth } = NextAuth(authConfig);

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: '401 Unauthorized: Please log in to delete your account.' }, { status: 401 });
    }

    await connectDB();

    // Delete user document from MongoDB
    const deletedUser = await User.findByIdAndDelete(session.user.id);
    if (!deletedUser) {
      return NextResponse.json({ error: 'User not found in database.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Account deleted successfully.' });
  } catch (error: any) {
    console.error('[Delete Account API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete account.' }, { status: 500 });
  }
}
