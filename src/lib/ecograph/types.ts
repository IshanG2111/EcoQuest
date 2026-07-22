export type NodeCategory =
  | 'Biodiversity'
  | 'Climate'
  | 'Pollution'
  | 'Policy'
  | 'Spatial'
  | 'User'
  | 'Quest';

export type NodeLabel =
  | 'Species'
  | 'Taxon'
  | 'Habitat'
  | 'ProtectedArea'
  | 'EcosystemService'
  | 'Pollutant'
  | 'EmissionSource'
  | 'ClimateTrend'
  | 'Policy'
  | 'Event'
  | 'Location'
  | 'Person'
  | 'User'
  | 'Quest';

export type EdgeType =
  | 'lives_in'
  | 'parent_taxon'
  | 'observed_at'
  | 'threatened_by'
  | 'affects'
  | 'emits'
  | 'reduces'
  | 'protects'
  | 'located_in'
  | 'part_of'
  | 'requires_action'
  | 'created_by'
  | 'explored';

export interface ProvenanceMetadata {
  source: string;
  license: string;
  confidenceScore: number;
  lastUpdated: string;
  externalUri?: string;
}

export interface EcoNode {
  id: string;
  label: NodeLabel;
  category: NodeCategory;
  name: string;
  scientificName?: string;
  description: string;
  summary?: string;
  attributes: Record<string, string | number | boolean | string[]>;
  spatial?: {
    coordinates?: [number, number]; // [lat, lng]
    region?: string;
    country?: string;
  };
  provenance: ProvenanceMetadata;
  tags: string[];
  icon?: string;
}

export interface EcoEdge {
  id: string;
  sourceId: string;
  targetId: string;
  type: EdgeType;
  label: string;
  weight?: number;
  attributes?: Record<string, string | number | boolean>;
  provenance: ProvenanceMetadata;
}

export interface GraphData {
  nodes: EcoNode[];
  edges: EcoEdge[];
}

export interface GraphPath {
  nodes: EcoNode[];
  edges: EcoEdge[];
  totalHops: number;
  confidenceScore: number;
}

export interface RAGAnswer {
  query: string;
  answer: string;
  confidence: number;
  matchedNodes: EcoNode[];
  evidencePaths: GraphPath[];
  sources: string[];
  executionTimeMs: number;
}

export interface DynamicQuest {
  id: string;
  title: string;
  description: string;
  targetNodeId: string;
  requiredPathIds: string[];
  xpReward: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  badgeReward?: string;
  category: NodeCategory;
  isCompleted?: boolean;
}

export interface GraphStats {
  totalNodes: number;
  totalEdges: number;
  nodesByCategory: Record<NodeCategory, number>;
  nodesByLabel: Record<string, number>;
  dataSources: Array<{ name: string; count: number; license: string }>;
  shaclValidationScore: number;
  freshnessTimestamp: string;
}
