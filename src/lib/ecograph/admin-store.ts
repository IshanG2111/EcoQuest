import { EcoNode, EcoEdge, GraphData } from './types';
import { INITIAL_ECOGRAPH_DATA } from './seed-data';
import connectDB from '@/lib/mongodb';
import EcoGraphNode from '@/models/EcoGraphNode';
import EcoGraphEdge from '@/models/EcoGraphEdge';
import EcoGraphPreset from '@/models/EcoGraphPreset';

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

class EcoGraphAdminStore {
  private static instance: EcoGraphAdminStore;
  private drafts: DraftEdit[] = [];
  private versionHistory: VersionSnapshot[] = [];

  private constructor() {}

  public static getInstance(): EcoGraphAdminStore {
    if (!EcoGraphAdminStore.instance) {
      EcoGraphAdminStore.instance = new EcoGraphAdminStore();
    }
    return EcoGraphAdminStore.instance;
  }

  // Ensure DB seed
  public async ensureSeed(): Promise<void> {
    await connectDB();
    const count = await EcoGraphNode.countDocuments();
    if (count === 0) {
      console.log('Seeding initial EcoGraph data to MongoDB Atlas...');
      for (const n of INITIAL_ECOGRAPH_DATA.nodes) {
        await EcoGraphNode.create(n);
      }
      for (const e of INITIAL_ECOGRAPH_DATA.edges) {
        await EcoGraphEdge.create(e);
      }
      await EcoGraphPreset.create({
        key: 'global_presets',
        repulsion: 1100,
        linkDist: 85,
        centerForce: 0.005,
        friction: 0.955,
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
      });
    }
  }

  public async getGraph(): Promise<GraphData> {
    await this.ensureSeed();
    const nodes = await EcoGraphNode.find().lean();
    const edges = await EcoGraphEdge.find().lean();

    return {
      nodes: nodes.map((n: any) => ({
        id: n.id,
        label: n.label,
        category: n.category,
        name: n.name,
        scientificName: n.scientificName,
        description: n.description,
        attributes: n.attributes || {},
        provenance: n.provenance,
        tags: n.tags || [],
        icon: n.icon || '📌',
      })),
      edges: edges.map((e: any) => ({
        id: e.id,
        sourceId: e.sourceId,
        targetId: e.targetId,
        type: e.type,
        label: e.label,
        weight: e.weight || 1.0,
        provenance: e.provenance,
      })),
    };
  }

  public getDrafts(): DraftEdit[] {
    return this.drafts;
  }

  public getVersionHistory(): VersionSnapshot[] {
    return this.versionHistory;
  }

  public async getPresets(): Promise<GlobalPresets> {
    await connectDB();
    const doc = await EcoGraphPreset.findOne({ key: 'global_presets' }).lean();
    if (doc) {
      return {
        repulsion: doc.repulsion,
        linkDist: doc.linkDist,
        centerForce: doc.centerForce,
        friction: doc.friction,
        nodeSize: doc.nodeSize,
        lineOpacity: doc.lineOpacity,
        categoryColors: doc.categoryColors || {},
      };
    }
    return {
      repulsion: 1100,
      linkDist: 85,
      centerForce: 0.005,
      friction: 0.955,
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
  }

  public async updatePresets(newPresets: Partial<GlobalPresets>): Promise<GlobalPresets> {
    await connectDB();
    const updated = await EcoGraphPreset.findOneAndUpdate(
      { key: 'global_presets' },
      { $set: newPresets },
      { new: true, upsert: true }
    ).lean();

    return {
      repulsion: updated.repulsion,
      linkDist: updated.linkDist,
      centerForce: updated.centerForce,
      friction: updated.friction,
      nodeSize: updated.nodeSize,
      lineOpacity: updated.lineOpacity,
      categoryColors: updated.categoryColors || {},
    };
  }

  // Node CRUD
  public async createNode(nodeData: Partial<EcoNode>): Promise<EcoNode> {
    await connectDB();
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

    await EcoGraphNode.create(newNode);

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

  public async updateNode(id: string, updates: Partial<EcoNode>): Promise<EcoNode | null> {
    await connectDB();
    const updated = await EcoGraphNode.findOneAndUpdate({ id }, { $set: updates }, { new: true }).lean();
    if (!updated) return null;

    this.drafts.push({
      id: `edit-${Date.now()}`,
      type: 'update_node',
      entityId: id,
      payload: updates,
      timestamp: new Date().toISOString(),
      author: 'Super Admin',
    });

    return updated as any;
  }

  public async deleteNode(id: string): Promise<boolean> {
    await connectDB();
    const deleted = await EcoGraphNode.findOneAndDelete({ id });
    await EcoGraphEdge.deleteMany({ $or: [{ sourceId: id }, { targetId: id }] });

    if (deleted) {
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

  // Edge CRUD
  public async createEdge(edgeData: { sourceId: string; targetId: string; type: any; label: string }): Promise<EcoEdge> {
    await connectDB();
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

    await EcoGraphEdge.create(newEdge);

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

  public async deleteEdge(id: string): Promise<boolean> {
    await connectDB();
    const deleted = await EcoGraphEdge.findOneAndDelete({ id });
    if (deleted) {
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

  public async getHealthMetrics() {
    const graph = await this.getGraph();
    const nodes = graph.nodes;
    const edges = graph.edges;

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

  public async publishChanges(commitMessage?: string): Promise<VersionSnapshot> {
    const graph = await this.getGraph();
    const snapshot: VersionSnapshot = {
      version: `v1.${this.versionHistory.length + 1}.0`,
      timestamp: new Date().toISOString(),
      nodeCount: graph.nodes.length,
      edgeCount: graph.edges.length,
      description: commitMessage || `Published ${this.drafts.length} pending draft edits`,
      data: graph,
    };

    this.versionHistory.unshift(snapshot);
    this.drafts = [];
    return snapshot;
  }
}

export const adminStore = EcoGraphAdminStore.getInstance();
