import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/ecograph/admin-store';
import { verifyAdminApiAuth } from '@/lib/ecograph/admin-auth-guard';

export async function POST(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { sourceId, targetId, type, label } = body;
    if (!sourceId || !targetId) {
      return NextResponse.json({ error: 'Missing sourceId or targetId.' }, { status: 400 });
    }
    const newEdge = adminStore.createEdge({ sourceId, targetId, type, label });
    return NextResponse.json({ success: true, edge: newEdge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Create Edge Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing edge id.' }, { status: 400 });
    }
    const deleted = adminStore.deleteEdge(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Delete Edge Error' }, { status: 500 });
  }
}
