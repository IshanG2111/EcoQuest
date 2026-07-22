import { NextResponse } from 'next/server';
import { EcoGraphEngine } from '@/lib/ecograph/engine';
import { NodeCategory } from '@/lib/ecograph/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const id = searchParams.get('id');
    const category = (searchParams.get('category') as NodeCategory) || undefined;
    const hops = parseInt(searchParams.get('hops') || '1', 10);

    const engine = EcoGraphEngine.getInstance();

    // Case 1: Fetch single entity by ID with optional k-hop neighborhood
    if (id) {
      const node = engine.getNode(id);
      if (!node) {
        return NextResponse.json({ error: `Node with id "${id}" not found.` }, { status: 404 });
      }
      const neighborhood = engine.getNeighborhood(id, hops);
      return NextResponse.json({
        success: true,
        entity: node,
        neighborhood,
      });
    }

    // Case 2: Search or list entities
    const nodes = engine.searchNodes(query, category);
    const edges = engine.getAllEdges();

    return NextResponse.json({
      success: true,
      count: nodes.length,
      nodes,
      edges,
    });
  } catch (error: any) {
    console.error('[EcoGraph Entities API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}
