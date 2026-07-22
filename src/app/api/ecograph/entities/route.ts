import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/ecograph/admin-store';
import { NodeCategory } from '@/lib/ecograph/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const id = searchParams.get('id');
    const category = (searchParams.get('category') as NodeCategory) || undefined;

    // Read live graph data from MongoDB Atlas
    const graphData = await adminStore.getGraph();
    let nodes = graphData.nodes;
    let edges = graphData.edges;

    // Filter by search query or category if provided
    if (query) {
      const qLower = query.toLowerCase();
      nodes = nodes.filter(
        (n) =>
          n.name.toLowerCase().includes(qLower) ||
          n.tags.some((t) => t.toLowerCase().includes(qLower)) ||
          n.category.toLowerCase().includes(qLower)
      );
    }

    if (category) {
      nodes = nodes.filter((n) => n.category === category);
    }

    if (id) {
      const node = graphData.nodes.find((n) => n.id === id);
      if (!node) {
        return NextResponse.json({ error: `Node with id "${id}" not found.` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        entity: node,
        neighborhood: graphData,
      });
    }

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
