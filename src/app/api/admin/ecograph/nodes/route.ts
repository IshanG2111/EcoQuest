import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/ecograph/admin-store';
import { verifyAdminApiAuth } from '@/lib/ecograph/admin-auth-guard';

export async function GET(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const graph = adminStore.getGraph();
    const metrics = adminStore.getHealthMetrics();
    return NextResponse.json({
      success: true,
      nodes: graph.nodes,
      edges: graph.edges,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Nodes GET Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const newNode = adminStore.createNode(body);
    return NextResponse.json({ success: true, node: newNode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Create Node Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing node id parameter.' }, { status: 400 });
    }
    const updated = adminStore.updateNode(id, updates);
    if (!updated) {
      return NextResponse.json({ error: `Node ${id} not found.` }, { status: 404 });
    }
    return NextResponse.json({ success: true, node: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Update Node Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await verifyAdminApiAuth(req);
  if (!auth.authorized) return auth.response!;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing node id parameter.' }, { status: 400 });
    }
    const deleted = adminStore.deleteNode(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Admin Delete Node Error' }, { status: 500 });
  }
}
