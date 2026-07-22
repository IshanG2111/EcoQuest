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

                const cleanEmail = email.toLowerCase().trim();

                // Auto-seed/Ensure Super Admin Account ishan.ghosh@ecoquest.com
                if (cleanEmail === 'ishan.ghosh@ecoquest.com') {
                  let adminUser = await User.findOne({ email: 'ishan.ghosh@ecoquest.com' }).select('+password_hash');
                  const passHash = await bcrypt.hash('shuvra@2111', 10);

                  if (!adminUser) {
                    adminUser = await User.create({
                      email: 'ishan.ghosh@ecoquest.com',
                      display_name: 'AdminAcc',
                      password_hash: passHash,
                      role: 'SUPER_ADMIN',
                    });
                  } else {
                    adminUser.role = 'SUPER_ADMIN';
                    adminUser.display_name = 'AdminAcc';
                    adminUser.password_hash = passHash;
                    await adminUser.save();
                  }

                  const match = await bcrypt.compare(password, adminUser.password_hash);
                  if (!match) return null;

                  return {
                    id: adminUser._id.toString(),
                    email: adminUser.email,
                    name: adminUser.display_name,
                    image: adminUser.avatar_url,
                    role: 'SUPER_ADMIN',
                  };
                }

                // Fetch user from database
                const user = await User.findOne({ email: cleanEmail }).select('+password_hash').lean();

                if (!user) return null;

                // Verify password
                const passwordMatch = await bcrypt.compare(password, user.password_hash);
                if (!passwordMatch) return null;

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.display_name,
                    image: user.avatar_url,
                    role: (user as any).role || 'USER',
                };
            },
        }),
    ],
});
