'use client';

import React, { useState, useEffect } from 'react';
import { EcoNode, EcoEdge, NodeCategory, NodeLabel } from '@/lib/ecograph/types';
import {
  Plus,
  GitBranch,
  Trash2,
  Edit3,
  Link2,
  Check,
  X,
  Search,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export const AdminVisualGraphEditor: React.FC = () => {
  const [nodes, setNodes] = useState<EcoNode[]>([]);
  const [edges, setEdges] = useState<EcoEdge[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Node Modal State
  const [showNodeModal, setShowNodeModal] = useState(false);
  const [editingNode, setEditingNode] = useState<EcoNode | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    scientificName: '',
    category: 'Biodiversity' as NodeCategory,
    label: 'Species' as NodeLabel,
    description: '',
    tags: 'Fauna, Endangered',
    icon: '🐅',
  });

  // Drag-and-Drop / Interactive Relationship Builder State
  const [linkSourceNode, setLinkSourceNode] = useState<EcoNode | null>(null);
  const [linkTargetNode, setLinkTargetNode] = useState<EcoNode | null>(null);
  const [linkType, setLinkType] = useState<string>('lives_in');
  const [linkLabel, setLinkLabel] = useState<string>('lives in habitat');
  const [showLinkModal, setShowLinkModal] = useState(false);

  useEffect(() => {
    fetchGraphData();
  }, []);

  const fetchGraphData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ecograph/nodes');
      const json = await res.json();
      if (json.success) {
        setNodes(json.nodes || []);
        setEdges(json.edges || []);
      }
    } catch (err) {
      console.error('Failed to fetch graph data for admin editor:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingNode(null);
    setFormData({
      name: '',
      scientificName: '',
      category: 'Biodiversity',
      label: 'Species',
      description: '',
      tags: 'Fauna, Endangered',
      icon: '🐅',
    });
    setShowNodeModal(true);
  };

  const handleOpenEditModal = (node: EcoNode) => {
    setEditingNode(node);
    setFormData({
      name: node.name,
      scientificName: node.scientificName || '',
      category: node.category,
      label: node.label,
      description: node.description,
      tags: node.tags.join(', '),
      icon: node.icon || '📌',
    });
    setShowNodeModal(true);
  };

  const handleSaveNode = async () => {
    try {
      const payload = {
        name: formData.name,
        scientificName: formData.scientificName,
        category: formData.category,
        label: formData.label,
        description: formData.description,
        tags: formData.tags.split(',').map((t) => t.trim()),
        icon: formData.icon,
      };

      if (editingNode) {
        // Update existing node
        const res = await fetch('/api/admin/ecograph/nodes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingNode.id, ...payload }),
        });
        const json = await res.json();
        if (json.success) {
          setNodes((prev) => prev.map((n) => (n.id === editingNode.id ? json.node : n)));
        }
      } else {
        // Create new node
        const res = await fetch('/api/admin/ecograph/nodes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          setNodes((prev) => [json.node, ...prev]);
        }
      }
      setShowNodeModal(false);
    } catch (err) {
      console.error('Failed to save node:', err);
    }
  };

  const handleDeleteNode = async (id: string) => {
    if (!confirm('Are you sure you want to delete this node? This will remove its connected edges.')) return;
    try {
      const res = await fetch(`/api/admin/ecograph/nodes?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setNodes((prev) => prev.filter((n) => n.id !== id));
        setEdges((prev) => prev.filter((e) => e.sourceId !== id && e.targetId !== id));
      }
    } catch (err) {
      console.error('Failed to delete node:', err);
    }
  };

  const handleCreateRelationship = async () => {
    if (!linkSourceNode || !linkTargetNode) return;
    try {
      const res = await fetch('/api/admin/ecograph/edges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: linkSourceNode.id,
          targetId: linkTargetNode.id,
          type: linkType,
          label: linkLabel,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setEdges((prev) => [...prev, json.edge]);
        setShowLinkModal(false);
        setLinkSourceNode(null);
        setLinkTargetNode(null);
      }
    } catch (err) {
      console.error('Failed to create relationship:', err);
    }
  };

  const handleDeleteEdge = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/ecograph/edges?id=${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setEdges((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete edge:', err);
    }
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || n.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-emerald-400" /> Visual Graph & Relationship Editor
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Create nodes, edit property attributes, and connect graph edges without writing raw queries.
          </p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition"
        >
          <Plus className="w-4 h-4" /> Add New Node
        </button>
      </div>

      {/* Relationship Builder Staging Bar */}
      {linkSourceNode && (
        <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl flex items-center justify-between text-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2 text-emerald-300">
            <Link2 className="w-4 h-4 text-emerald-400" />
            <span>
              Relationship Source: <strong className="text-white">[{linkSourceNode.name}]</strong>. Select a target node to complete connection.
            </span>
          </div>
          <button
            onClick={() => setLinkSourceNode(null)}
            className="px-2.5 py-1 bg-zinc-900 text-zinc-400 hover:text-white rounded text-[11px]"
          >
            Cancel Linking
          </button>
        </div>
      )}

      {/* Search & Category Filter Controls */}
      <div className="flex items-center justify-between gap-3 bg-[#11131c] border border-zinc-800/80 p-3 rounded-xl">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 flex-1 max-w-md">
          <Search className="w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entities or tags..."
            className="w-full bg-transparent text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'Biodiversity', 'Spatial', 'Pollution', 'Climate', 'Policy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Nodes Table & Visual Actions */}
      <div className="bg-[#11131c] border border-zinc-800/80 rounded-xl overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-xs text-zinc-400 font-mono">
          <span>{filteredNodes.length} Graph Entities</span>
          <span>{edges.length} Total Edges</span>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {filteredNodes.map((node) => {
            const connectedEdges = edges.filter((e) => e.sourceId === node.id || e.targetId === node.id);

            return (
              <div
                key={node.id}
                className="p-4 hover:bg-zinc-900/40 transition flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{node.icon || '📌'}</span>
                    <h3 className="text-sm font-bold text-white">{node.name}</h3>
                    {node.scientificName && (
                      <span className="text-xs text-zinc-400 italic">({node.scientificName})</span>
                    )}
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-zinc-800 text-emerald-400 uppercase">
                      {node.category} • {node.label}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2">{node.description}</p>

                  <div className="flex items-center gap-2 pt-1">
                    {node.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-950 text-zinc-500 border border-zinc-800"
                      >
                        #{tag}
                      </span>
                    ))}
                    <span className="text-[10px] text-zinc-500 font-mono ml-2">
                      {connectedEdges.length} connections
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (linkSourceNode?.id === node.id) {
                        setLinkSourceNode(null);
                      } else if (linkSourceNode) {
                        setLinkTargetNode(node);
                        setShowLinkModal(true);
                      } else {
                        setLinkSourceNode(node);
                      }
                    }}
                    className={`px-2.5 py-1.5 rounded text-xs font-medium border flex items-center gap-1 transition ${
                      linkSourceNode?.id === node.id
                        ? 'bg-amber-600 border-amber-500 text-white'
                        : 'bg-zinc-900 border-zinc-800 text-emerald-400 hover:bg-zinc-800'
                    }`}
                    title="Connect relationship link"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                    {linkSourceNode?.id === node.id ? 'Linking Source' : linkSourceNode ? 'Select Target' : 'Link Node'}
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(node)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded text-zinc-400 hover:text-white transition"
                    title="Edit Node Attributes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleDeleteNode(node.id)}
                    className="p-1.5 bg-zinc-900 hover:bg-rose-950 border border-zinc-800 hover:border-rose-800 rounded text-zinc-400 hover:text-rose-400 transition"
                    title="Delete Node"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal 1: Create / Edit Node Modal */}
      {showNodeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-zinc-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                {editingNode ? 'Edit Knowledge Node' : 'Create New Knowledge Node'}
              </h3>
              <button onClick={() => setShowNodeModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Entity Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Great Indian Bustard"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as any }))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Biodiversity">Biodiversity</option>
                    <option value="Spatial">Spatial</option>
                    <option value="Pollution">Pollution</option>
                    <option value="Climate">Climate</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Scientific Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.scientificName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, scientificName: e.target.value }))}
                    placeholder="e.g. Ardeotis nigriceps"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Description / Vault Note</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="Comprehensive summary of ecological role, status, or environmental impact..."
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-400 block mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData((prev) => ({ ...prev, tags: e.target.value }))}
                    placeholder="Fauna, Endangered, Avian"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Emoji Icon</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="🦅"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button
                onClick={() => setShowNodeModal(false)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNode}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Save Node
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create Relationship Link Modal */}
      {showLinkModal && linkSourceNode && linkTargetNode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11131c] border border-zinc-800 rounded-xl w-full max-w-md p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-emerald-400" /> Create Relationship Edge
              </h3>
              <button onClick={() => setShowLinkModal(false)} className="text-zinc-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 text-xs space-y-1 font-mono">
              <div className="text-emerald-400">Source: [{linkSourceNode.name}]</div>
              <div className="text-sky-400">Target: [{linkTargetNode.name}]</div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-zinc-400 block mb-1">Relationship Type</label>
                <select
                  value={linkType}
                  onChange={(e) => setLinkType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="lives_in">lives_in (Habitat)</option>
                  <option value="threatened_by">threatened_by (Stressor)</option>
                  <option value="emits">emits (Pollutant)</option>
                  <option value="reduces">reduces (Policy Impact)</option>
                  <option value="protects">protects (Sanctuary)</option>
                  <option value="affects">affects (General)</option>
                  <option value="part_of">part_of (Sub-concept)</option>
                </select>
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Edge Label Description</label>
                <input
                  type="text"
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                  placeholder="e.g. lives in coastal mangrove biome"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded p-2 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-zinc-800 pt-3">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRelationship}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> Connect Relationship
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
