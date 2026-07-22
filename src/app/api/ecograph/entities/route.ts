import { NextResponse } from 'next/server';
import { adminStore } from '@/lib/ecograph/admin-store';
import { NodeCategory, EcoNode, EcoEdge } from '@/lib/ecograph/types';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const id = searchParams.get('id');
    const category = (searchParams.get('category') as NodeCategory) || undefined;
    const maxHops = Math.min(3, Math.max(1, parseInt(searchParams.get('hops') || '2', 10)));

    // Read live graph data from MongoDB Atlas
    const graphData = await adminStore.getGraph();

    // Calculate category counts
    const categoryCounts: Record<string, number> = {
      Biodiversity: 0,
      Spatial: 0,
      Pollution: 0,
      Climate: 0,
      Policy: 0,
      User: 0,
      Quest: 0,
    };

    graphData.nodes.forEach((n) => {
      if (categoryCounts[n.category] !== undefined) {
        categoryCounts[n.category]++;
      }
    });

    // ─── Case 1: Rich Node Inspection with Top Connections & Stats ──────────
    if (id) {
      const targetNode = graphData.nodes.find((n) => n.id === id);
      if (!targetNode) {
        return NextResponse.json({ error: `Node with id "${id}" not found.` }, { status: 404 });
      }

      // Calculate connections
      const connectedEdges = graphData.edges.filter((e) => e.sourceId === id || e.targetId === id);
      const incomingEdges = graphData.edges.filter((e) => e.targetId === id);
      const outgoingEdges = graphData.edges.filter((e) => e.sourceId === id);

      const topConnections = connectedEdges.slice(0, 5).map((e) => {
        const otherId = e.sourceId === id ? e.targetId : e.sourceId;
        const otherNode = graphData.nodes.find((n) => n.id === otherId);
        return {
          id: otherId,
          name: otherNode?.name || otherId,
          category: otherNode?.category || 'General',
          relation: e.label || e.type,
          type: e.type,
        };
      });

      // Build 2-hop BFS Neighborhood
      const adjMap = new Map<string, Set<string>>();
      graphData.edges.forEach((edge) => {
        if (!adjMap.has(edge.sourceId)) adjMap.set(edge.sourceId, new Set());
        if (!adjMap.has(edge.targetId)) adjMap.set(edge.targetId, new Set());
        adjMap.get(edge.sourceId)!.add(edge.targetId);
        adjMap.get(edge.targetId)!.add(edge.sourceId);
      });

      const visitedNodes = new Set<string>([id]);
      let currentQueue = [id];

      for (let hop = 0; hop < maxHops; hop++) {
        const nextQueue: string[] = [];
        for (const currId of currentQueue) {
          const neighbors = adjMap.get(currId);
          if (neighbors) {
            for (const nbrId of Array.from(neighbors)) {
              if (!visitedNodes.has(nbrId)) {
                visitedNodes.add(nbrId);
                nextQueue.push(nbrId);
              }
            }
          }
        }
        currentQueue = nextQueue;
      }

      const subNodes = graphData.nodes.filter((n) => visitedNodes.has(n.id));
      const subEdges = graphData.edges.filter(
        (e) => visitedNodes.has(e.sourceId) && visitedNodes.has(e.targetId)
      );

      return NextResponse.json({
        success: true,
        entity: {
          ...targetNode,
          stats: {
            connectedNodesCount: connectedEdges.length,
            incomingLinksCount: incomingEdges.length,
            outgoingLinksCount: outgoingEdges.length,
            dataSourcesCount: 12,
          },
          topConnections,
        },
        neighborhood: {
          nodes: subNodes,
          edges: subEdges,
        },
      });
    }

    // ─── Case 2: List / Search Nodes ────────────────────────────────────────
    let nodes = graphData.nodes;
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

    return NextResponse.json({
      success: true,
      count: nodes.length,
      categoryCounts,
      nodes,
      edges: graphData.edges,
    });
  } catch (error: any) {
    console.error('[EcoGraph Entities API Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Knowledge Engine Error' },
      { status: 500 }
    );
  }
}
