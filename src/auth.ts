import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                // Validate input shape
                const parsed = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsed.success) return null;

                const { email, password } = parsed.data;

                // Connect to DB
                await connectDB();

                // Fetch user from database
                const user = await User.findOne({ email: email.toLowerCase() }).select('+password_hash').lean();

                if (!user) return null;

                // Verify password
                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (!passwordMatch) return null;

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.display_name,
                    image: user.avatar_url,
                    role: user.role,
                };
            },
        }),
    ],
});
