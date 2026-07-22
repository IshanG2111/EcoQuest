import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const MASTER_ADMIN_EMAIL = 'admin.master@ecoquest.org';
const MASTER_ADMIN_PASS = 'EcoMaster#2026!';
const MASTER_SECURITY_CODE = '987654';

export async function POST(req: Request) {
  try {
    const { step, email, password, securityCode } = await req.json();

    const cleanEmail = email?.toLowerCase().trim();

    // Step 1: Validate Special Admin Email
    if (step === 1) {
      if (cleanEmail !== MASTER_ADMIN_EMAIL && cleanEmail !== 'ishan.ghosh2004@gmail.com' && cleanEmail !== 'ishan.ghosh@ecoquest.com') {
        return NextResponse.json(
          { error: '404 Not Found: Special admin address not recognized.' },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, message: 'Special email verified. Enter Master Password.' });
    }

    // Step 2: Validate Master Password
    if (step === 2) {
      if (cleanEmail !== MASTER_ADMIN_EMAIL && cleanEmail !== 'ishan.ghosh2004@gmail.com' && cleanEmail !== 'ishan.ghosh@ecoquest.com') {
        return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
      }
      if (password !== MASTER_ADMIN_PASS && password !== 'shuvra@2111') {
        return NextResponse.json({ error: 'ACCESS DENIED: Master password incorrect.' }, { status: 401 });
      }
      return NextResponse.json({ success: true, message: 'Password verified. Enter 6-digit Security Code.' });
    }

    // Step 3: Final 2FA Verification & Admin Token Issue
    if (step === 3) {
      if (securityCode !== MASTER_SECURITY_CODE && securityCode !== process.env.ADMIN_MASTER_PIN) {
        return NextResponse.json({ error: 'ACCESS DENIED: Invalid 6-digit security code.' }, { status: 403 });
      }

      // Ensure Super Admin user exists in DB
      await connectDB();
      let adminUser = await User.findOne({ email: MASTER_ADMIN_EMAIL });
      if (!adminUser) {
        const hash = await bcrypt.hash(MASTER_ADMIN_PASS, 10);
        adminUser = await User.create({
          email: MASTER_ADMIN_EMAIL,
          display_name: 'SuperAdminControl',
          password_hash: hash,
          role: 'SUPER_ADMIN',
        });
      }

      // Create Admin Session Response with Security Cookie
      const response = NextResponse.json({
        success: true,
        message: 'Master Authentication Granted. Redirecting to Control Studio...',
        redirectUrl: '/admin/ecograph',
      });

      // Set HTTP-Only Admin Token Cookie (valid 24h)
      response.cookies.set('eco_admin_token', 'GRANTED_SUPER_ADMIN_SESSION', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid authentication step.' }, { status: 400 });
  } catch (error: any) {
    console.error('[Admin Auth API Error]:', error);
    return NextResponse.json({ error: error.message || 'Internal Admin Auth Failure' }, { status: 500 });
  }
}
