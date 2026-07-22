import { INITIAL_ECOGRAPH_DATA } from './seed-data';
import { EcoEdge, EcoNode, GraphData, GraphPath, GraphStats, NodeCategory } from './types';

export class EcoGraphEngine {
  private static instance: EcoGraphEngine;
  private nodesMap: Map<string, EcoNode> = new Map();
  private edgesMap: Map<string, EcoEdge> = new Map();
  private adjacencyList: Map<string, EcoEdge[]> = new Map();

  private constructor() {
    this.loadGraph(INITIAL_ECOGRAPH_DATA);
  }

  public static getInstance(): EcoGraphEngine {
    if (!EcoGraphEngine.instance) {
      EcoGraphEngine.instance = new EcoGraphEngine();
    }
    return EcoGraphEngine.instance;
  }

  public loadGraph(data: GraphData): void {
    this.nodesMap.clear();
    this.edgesMap.clear();
    this.adjacencyList.clear();

    for (const node of data.nodes) {
      this.nodesMap.set(node.id, node);
      this.adjacencyList.set(node.id, []);
    }

    for (const edge of data.edges) {
      this.edgesMap.set(edge.id, edge);
      
      const outgoing = this.adjacencyList.get(edge.sourceId) || [];
      outgoing.push(edge);
      this.adjacencyList.set(edge.sourceId, outgoing);

      // Add bi-directional entry for undirected path searches
      const incoming = this.adjacencyList.get(edge.targetId) || [];
      incoming.push(edge);
      this.adjacencyList.set(edge.targetId, incoming);
    }
  }

  public getNode(id: string): EcoNode | undefined {
    return this.nodesMap.get(id);
  }

  public getAllNodes(): EcoNode[] {
    return Array.from(this.nodesMap.values());
  }

  public getAllEdges(): EcoEdge[] {
    return Array.from(this.edgesMap.values());
  }

  public searchNodes(query: string, category?: NodeCategory): EcoNode[] {
    const q = query.toLowerCase().trim();
    return Array.from(this.nodesMap.values()).filter((node) => {
      if (category && node.category !== category) return false;
      if (!q) return true;

      return (
        node.name.toLowerCase().includes(q) ||
        node.scientificName?.toLowerCase().includes(q) ||
        node.description.toLowerCase().includes(q) ||
        node.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }

  /**
   * k-hop neighborhood expansion centered around a given node ID
   */
  public getNeighborhood(centerNodeId: string, maxHops: number = 2): GraphData {
    const visitedNodes = new Set<string>();
    const matchedEdges = new Set<string>();
    const queue: Array<{ nodeId: string; depth: number }> = [{ nodeId: centerNodeId, depth: 0 }];

    visitedNodes.add(centerNodeId);

    while (queue.length > 0) {
      const { nodeId, depth } = queue.shift()!;
      if (depth >= maxHops) continue;

      const edges = this.adjacencyList.get(nodeId) || [];
      for (const edge of edges) {
        matchedEdges.add(edge.id);
        const neighborId = edge.sourceId === nodeId ? edge.targetId : edge.sourceId;

        if (!visitedNodes.has(neighborId)) {
          visitedNodes.add(neighborId);
          queue.push({ nodeId: neighborId, depth: depth + 1 });
        }
      }
    }

    const nodes = Array.from(visitedNodes)
      .map((id) => this.nodesMap.get(id))
      .filter((n): n is EcoNode => n !== undefined);

    const edges = Array.from(matchedEdges)
      .map((id) => this.edgesMap.get(id))
      .filter((e): e is EcoEdge => e !== undefined);

    return { nodes, edges };
  }

  /**
   * Breadth-First Search for the shortest path between startNodeId and endNodeId
   */
  public findShortestPath(startNodeId: string, endNodeId: string): GraphPath | null {
    if (!this.nodesMap.has(startNodeId) || !this.nodesMap.has(endNodeId)) {
      return null;
    }

    if (startNodeId === endNodeId) {
      const startNode = this.nodesMap.get(startNodeId)!;
      return {
        nodes: [startNode],
        edges: [],
        totalHops: 0,
        confidenceScore: 1.0,
      };
    }

    const queue: Array<{ nodeId: string; pathNodes: string[]; pathEdges: EcoEdge[] }> = [
      { nodeId: startNodeId, pathNodes: [startNodeId], pathEdges: [] },
    ];
    const visited = new Set<string>([startNodeId]);

    while (queue.length > 0) {
      const { nodeId, pathNodes, pathEdges } = queue.shift()!;

      if (nodeId === endNodeId) {
        const nodes = pathNodes.map((id) => this.nodesMap.get(id)!);
        const confidenceScore = pathEdges.reduce((acc, e) => acc * (e.provenance.confidenceScore || 0.9), 1.0);
        return {
          nodes,
          edges: pathEdges,
          totalHops: pathEdges.length,
          confidenceScore: Math.round(confidenceScore * 100) / 100,
        };
      }

      const edges = this.adjacencyList.get(nodeId) || [];
      for (const edge of edges) {
        const nextId = edge.sourceId === nodeId ? edge.targetId : edge.sourceId;
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({
            nodeId: nextId,
            pathNodes: [...pathNodes, nextId],
            pathEdges: [...pathEdges, edge],
          });
        }
      }
    }

    return null; // Path not found
  }

  /**
   * Entity Resolution: resolves raw string input or external ID to canonical node
   */
  public resolveEntity(term: string): EcoNode | undefined {
    const raw = term.toLowerCase().trim();

    // Check exact name match
    for (const node of this.nodesMap.values()) {
      if (node.name.toLowerCase() === raw) return node;
      if (node.scientificName && node.scientificName.toLowerCase() === raw) return node;
      if (node.id.toLowerCase() === raw) return node;
    }

    // Check partial string contains
    for (const node of this.nodesMap.values()) {
      if (node.name.toLowerCase().includes(raw) || node.tags.some((t) => t.toLowerCase() === raw)) {
        return node;
      }
    }

    return undefined;
  }

  /**
   * Validates graph schema compliance (SHACL-style shapes check)
   */
  public validateGraphSchema(): { score: number; errors: string[] } {
    const errors: string[] = [];
    let validCount = 0;
    const totalItems = this.nodesMap.size + this.edgesMap.size;

    // Validate Nodes
    for (const node of this.nodesMap.values()) {
      let isNodeValid = true;
      if (!node.id || !node.name || !node.category || !node.label) {
        errors.push(`Node [${node.id}] missing required header fields (id/name/category/label).`);
        isNodeValid = false;
      }
      if (!node.provenance || !node.provenance.source || !node.provenance.license) {
        errors.push(`Node [${node.id}] missing complete provenance info.`);
        isNodeValid = false;
      }
      if (node.spatial?.coordinates) {
        const [lat, lng] = node.spatial.coordinates;
        if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          errors.push(`Node [${node.id}] contains invalid lat/lng coordinates [${lat}, ${lng}].`);
          isNodeValid = false;
        }
      }
      if (isNodeValid) validCount++;
    }

    // Validate Edges
    for (const edge of this.edgesMap.values()) {
      let isEdgeValid = true;
      if (!this.nodesMap.has(edge.sourceId)) {
        errors.push(`Edge [${edge.id}] references missing sourceId [${edge.sourceId}].`);
        isEdgeValid = false;
      }
      if (!this.nodesMap.has(edge.targetId)) {
        errors.push(`Edge [${edge.id}] references missing targetId [${edge.targetId}].`);
        isEdgeValid = false;
      }
      if (isEdgeValid) validCount++;
    }

    const score = Math.round((validCount / (totalItems || 1)) * 100);
    return { score, errors };
  }

  public getStats(): GraphStats {
    const nodesByCategory: Record<NodeCategory, number> = {
      Biodiversity: 0,
      Climate: 0,
      Pollution: 0,
      Policy: 0,
      Spatial: 0,
      User: 0,
      Quest: 0,
    };

    const nodesByLabel: Record<string, number> = {};
    const sourcesMap = new Map<string, { count: number; license: string }>();

    for (const node of this.nodesMap.values()) {
      nodesByCategory[node.category] = (nodesByCategory[node.category] || 0) + 1;
      nodesByLabel[node.label] = (nodesByLabel[node.label] || 0) + 1;

      const src = node.provenance.source;
      const existing = sourcesMap.get(src) || { count: 0, license: node.provenance.license };
      existing.count++;
      sourcesMap.set(src, existing);
    }

    const validation = this.validateGraphSchema();

    return {
      totalNodes: this.nodesMap.size,
      totalEdges: this.edgesMap.size,
      nodesByCategory,
      nodesByLabel,
      dataSources: Array.from(sourcesMap.entries()).map(([name, val]) => ({
        name,
        count: val.count,
        license: val.license,
      })),
      shaclValidationScore: validation.score,
      freshnessTimestamp: new Date().toISOString(),
    };
  }
}
