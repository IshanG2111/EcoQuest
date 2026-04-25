import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Badge from '@/models/Badge';

const RegisterSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    displayName: z.string().min(2, 'Username must be at least 2 characters').max(30),
    role: z.enum(['user', 'admin']).optional().default('user'),
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const parsed = RegisterSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: parsed.error.errors[0].message },
                { status: 400 }
            );
        }

        const { email, password, displayName, role } = parsed.data;

        await connectDB();

        // Check if user already exists
        const existing = await User.findOne({ email: email.toLowerCase() }).select('_id').lean();

        if (existing) {
            return NextResponse.json(
                { error: 'An account with this email already exists.' },
                { status: 409 }
            );
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Fetch "First Steps" badge
        const badge = await Badge.findOne({ name: 'First Steps' }).select('_id').lean();

        // Create new user
        const initialBadges = badge ? [{ badge_id: badge._id }] : [];

        const newUser = await User.create({
            email: email.toLowerCase(),
            password_hash,
            display_name: displayName,
            role,
            avatar_url: `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(displayName)}`,
            points: 0,
            streak: 0,
            last_active: new Date().toISOString().split('T')[0],
            badges: initialBadges,
        });

        if (!newUser) {
            return NextResponse.json(
                { error: 'Failed to create account. Please try again.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'Account created successfully', user: { id: newUser._id.toString(), email: newUser.email, role: newUser.role } },
            { status: 201 }
        );
    } catch (error) {
        console.error('Register error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
