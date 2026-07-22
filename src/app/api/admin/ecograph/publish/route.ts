import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/ecograph/admin-store';
import { verifyAdminApiAuth } from '@/lib/ecograph/admin-auth-guard';

export async function GET(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const drafts = adminStore.getDrafts();
    const history = adminStore.getVersionHistory();
    const presets = await adminStore.getPresets();
    return NextResponse.json({
      success: true,
      drafts,
      history,
      presets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Publish GET Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { action, commitMessage, newPresets } = body;

    if (action === 'publish') {
      const snapshot = await adminStore.publishChanges(commitMessage);
      return NextResponse.json({ success: true, publishedVersion: snapshot });
    }

    if (action === 'update_presets' && newPresets) {
      const updated = await adminStore.updatePresets(newPresets);
      return NextResponse.json({ success: true, presets: updated });
    }

    return NextResponse.json({ error: 'Invalid action parameter.' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Publish Error' }, { status: 500 });
  }
}
