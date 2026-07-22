import { EcoNode, EcoEdge, GraphData, NodeCategory, NodeLabel } from './types';
import { INITIAL_ECOGRAPH_DATA } from './seed-data';

export interface DraftEdit {
  id: string;
  type: 'create_node' | 'update_node' | 'delete_node' | 'create_edge' | 'delete_edge';
  entityId: string;
  payload: any;
  timestamp: string;
  author: string;
}

export interface VersionSnapshot {
  version: string;
  timestamp: string;
  nodeCount: number;
  edgeCount: number;
  description: string;
  data: GraphData;
}

export interface GlobalPresets {
  repulsion: number;
  linkDist: number;
  centerForce: number;
  friction: number;
  nodeSize: number;
  lineOpacity: number;
  categoryColors: Record<string, string>;
}

// In-Memory Admin State Store (persisted to graph engine)
class EcoGraphAdminStore {
  private static instance: EcoGraphAdminStore;
  private currentGraph: GraphData;
  private drafts: DraftEdit[] = [];
  private versionHistory: VersionSnapshot[] = [];
  private presets: GlobalPresets;

  private constructor() {
    this.currentGraph = JSON.parse(JSON.stringify(INITIAL_ECOGRAPH_DATA));
    this.presets = {
      repulsion: 1400,
      linkDist: 80,
      centerForce: 0.008,
      friction: 0.92,
      nodeSize: 1.2,
      lineOpacity: 0.35,
      categoryColors: {
        Biodiversity: '#10b981',
        Spatial: '#38bdf8',
        Pollution: '#f43f5e',
        Climate: '#f97316',
        Policy: '#a855f7',
        User: '#ec4899',
        Quest: '#06b6d4',
      },
    };

    // Initial Baseline Version
    this.versionHistory.push({
      version: 'v1.0.0',
      timestamp: new Date().toISOString(),
      nodeCount: this.currentGraph.nodes.length,
      edgeCount: this.currentGraph.edges.length,
      description: 'Initial Seed Knowledge Graph Baseline',
      data: JSON.parse(JSON.stringify(this.currentGraph)),
    });
  }

  public static getInstance(): EcoGraphAdminStore {
    if (!EcoGraphAdminStore.instance) {
      EcoGraphAdminStore.instance = new EcoGraphAdminStore();
    }
    return EcoGraphAdminStore.instance;
  }

  public getGraph(): GraphData {
    return this.currentGraph;
  }

  public getDrafts(): DraftEdit[] {
    return this.drafts;
  }

  public getVersionHistory(): VersionSnapshot[] {
    return this.versionHistory;
  }

  public getPresets(): GlobalPresets {
    return this.presets;
  }

  public updatePresets(newPresets: Partial<GlobalPresets>): GlobalPresets {
    this.presets = { ...this.presets, ...newPresets };
    return this.presets;
  }

  // Node CRUD Operations
  public createNode(nodeData: Partial<EcoNode>): EcoNode {
    const id = nodeData.id || `node-${Date.now()}`;
    const newNode: EcoNode = {
      id,
      label: nodeData.label || 'Species',
      category: nodeData.category || 'Biodiversity',
      name: nodeData.name || 'New Entity',
      scientificName: nodeData.scientificName || '',
      description: nodeData.description || 'Admin created knowledge node.',
      attributes: nodeData.attributes || {},
      provenance: nodeData.provenance || {
        source: 'EcoGraph Knowledge Studio',
        license: 'CC-BY 4.0',
        confidenceScore: 1.0,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
      tags: nodeData.tags || ['AdminCreated'],
      icon: nodeData.icon || '📌',
    };

    this.currentGraph.nodes.push(newNode);
    this.drafts.push({
      id: `edit-${Date.now()}`,
      type: 'create_node',
      entityId: id,
      payload: newNode,
      timestamp: new Date().toISOString(),
      author: 'Super Admin',
    });

    return newNode;
  }

  public updateNode(id: string, updates: Partial<EcoNode>): EcoNode | null {
    const index = this.currentGraph.nodes.findIndex((n) => n.id === id);
    if (index === -1) return null;

    this.currentGraph.nodes[index] = { ...this.currentGraph.nodes[index], ...updates };
    this.drafts.push({
      id: `edit-${Date.now()}`,
      type: 'update_node',
      entityId: id,
      payload: updates,
      timestamp: new Date().toISOString(),
      author: 'Super Admin',
    });

    return this.currentGraph.nodes[index];
  }

  public deleteNode(id: string): boolean {
    const initialLen = this.currentGraph.nodes.length;
    this.currentGraph.nodes = this.currentGraph.nodes.filter((n) => n.id !== id);
    this.currentGraph.edges = this.currentGraph.edges.filter(
      (e) => e.sourceId !== id && e.targetId !== id
    );

    if (this.currentGraph.nodes.length < initialLen) {
      this.drafts.push({
        id: `edit-${Date.now()}`,
        type: 'delete_node',
        entityId: id,
        payload: { id },
        timestamp: new Date().toISOString(),
        author: 'Super Admin',
      });
      return true;
    }
    return false;
  }

  // Edge CRUD Operations
  public createEdge(edgeData: { sourceId: string; targetId: string; type: any; label: string }): EcoEdge {
    const id = `edge-${Date.now()}`;
    const newEdge: EcoEdge = {
      id,
      sourceId: edgeData.sourceId,
      targetId: edgeData.targetId,
      type: edgeData.type || 'affects',
      label: edgeData.label || 'connected concept',
      weight: 0.9,
      provenance: {
        source: 'EcoGraph Knowledge Studio Visual Editor',
        license: 'CC-BY 4.0',
        confidenceScore: 1.0,
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    };

    this.currentGraph.edges.push(newEdge);
    this.drafts.push({
      id: `edit-${Date.now()}`,
      type: 'create_edge',
      entityId: id,
      payload: newEdge,
      timestamp: new Date().toISOString(),
      author: 'Super Admin',
    });

    return newEdge;
  }

  public deleteEdge(id: string): boolean {
    const initialLen = this.currentGraph.edges.length;
    this.currentGraph.edges = this.currentGraph.edges.filter((e) => e.id !== id);
    if (this.currentGraph.edges.length < initialLen) {
      this.drafts.push({
        id: `edit-${Date.now()}`,
        type: 'delete_edge',
        entityId: id,
        payload: { id },
        timestamp: new Date().toISOString(),
        author: 'Super Admin',
      });
      return true;
    }
    return false;
  }

  // Publish & Rollback Operations
  public publishChanges(commitMessage?: string): VersionSnapshot {
    const nextVer = `v1.${this.versionHistory.length}.0`;
    const snapshot: VersionSnapshot = {
      version: nextVer,
      timestamp: new Date().toISOString(),
      nodeCount: this.currentGraph.nodes.length,
      edgeCount: this.currentGraph.edges.length,
      description: commitMessage || `Published ${this.drafts.length} pending draft edits`,
      data: JSON.parse(JSON.stringify(this.currentGraph)),
    };

    this.versionHistory.unshift(snapshot);
    this.drafts = [];
    return snapshot;
  }

  public rollbackToVersion(version: string): VersionSnapshot | null {
    const target = this.versionHistory.find((v) => v.version === version);
    if (!target) return null;

    this.currentGraph = JSON.parse(JSON.stringify(target.data));
    this.drafts = [];
    return target;
  }

  // Quality Analytics
  public getHealthMetrics() {
    const nodes = this.currentGraph.nodes;
    const edges = this.currentGraph.edges;

    const edgeNodeIds = new Set<string>();
    edges.forEach((e) => {
      edgeNodeIds.add(e.sourceId);
      edgeNodeIds.add(e.targetId);
    });

    const orphanNodes = nodes.filter((n) => !edgeNodeIds.has(n.id));
    const missingCitations = nodes.filter((n) => !n.provenance || !n.provenance.source);

    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      orphanNodeCount: orphanNodes.length,
      missingCitationCount: missingCitations.length,
      pendingDraftCount: this.drafts.length,
      healthScore: Math.round(
        100 - (orphanNodes.length / (nodes.length || 1)) * 30 - (missingCitations.length / (nodes.length || 1)) * 20
      ),
    };
  }
}

export const adminStore = EcoGraphAdminStore.getInstance();
