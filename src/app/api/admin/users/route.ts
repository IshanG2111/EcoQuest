import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { verifyAdminApiAuth } from '@/lib/ecograph/admin-auth-guard';

export async function GET(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    let filter: any = {};
    if (query) {
      filter = {
        $or: [
          { email: { $regex: query, $options: 'i' } },
          { display_name: { $regex: query, $options: 'i' } },
        ],
      };
    }

    const users = await User.find(filter)
      .select('-password_hash')
      .sort({ createdAt: -1 })
      .lean();

    const totalUsers = await User.countDocuments();
    const adminCount = await User.countDocuments({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] } });
    const userCount = totalUsers - adminCount;

    return NextResponse.json({
      success: true,
      users: users.map((u: any) => ({
        id: u._id.toString(),
        email: u.email,
        display_name: u.display_name,
        avatar_url: u.avatar_url,
        role: u.role || 'USER',
        points: u.points || 0,
        streak: u.streak || 0,
        last_active: u.last_active,
        createdAt: u.createdAt,
      })),
      stats: {
        totalUsers,
        adminCount,
        userCount,
      },
    });
  } catch (error: any) {
    console.error('[Admin Users GET API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await connectDB();
    const { userId, role, points, streak } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (role && ['USER', 'ADMIN', 'SUPER_ADMIN'].includes(role)) {
      updateData.role = role;
    }
    if (typeof points === 'number') {
      updateData.points = points;
    }
    if (typeof streak === 'number') {
      updateData.streak = streak;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password_hash').lean();

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: (updatedUser as any)._id.toString(),
        email: (updatedUser as any).email,
        display_name: (updatedUser as any).display_name,
        role: (updatedUser as any).role,
        points: (updatedUser as any).points,
        streak: (updatedUser as any).streak,
      },
    });
  } catch (error: any) {
    console.error('[Admin Users PUT API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User account successfully removed.' });
  } catch (error: any) {
    console.error('[Admin Users DELETE API Error]:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete user' }, { status: 500 });
  }
}
