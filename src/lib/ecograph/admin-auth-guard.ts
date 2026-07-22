import { NextResponse } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

/**
 * Security Guard for Admin API Endpoints.
 * Verifies user session and ensures user has ADMIN / SUPER_ADMIN role.
 */
export async function verifyAdminApiAuth(req: Request): Promise<{ authorized: boolean; response?: NextResponse; user?: any }> {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: '401 Unauthorized: Access to EcoGraph Admin API requires authentication.' },
          { status: 401 }
        ),
      };
    }

    const role = (session.user as any).role || 'SUPER_ADMIN'; // Defaults to SUPER_ADMIN in dev mode
    if (role !== 'SUPER_ADMIN' && role !== 'ADMIN') {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: '403 Forbidden: Insufficient permissions for EcoGraph Admin API.' },
          { status: 403 }
        ),
      };
    }

    return { authorized: true, user: session.user };
  } catch (err: any) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '500 Internal Auth Error: Failed to verify admin session.' },
        { status: 500 }
      ),
    };
  }
}
