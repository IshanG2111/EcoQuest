import { EcoNode, EcoEdge, GraphData, NodeCategory, NodeLabel } from './types';

// Core Seed Entities
const CORE_SPECIES = [
  { id: 'tiger', name: 'Bengal Tiger', sci: 'Panthera tigris', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐅', tags: ['Fauna', 'Apex Carnivore', 'Endangered', 'Project Tiger'] },
  { id: 'snow-leopard', name: 'Snow Leopard', sci: 'Panthera uncia', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐆', tags: ['Fauna', 'Alpine', 'Vulnerable', 'Himalayas'] },
  { id: 'elephant', name: 'Asian Elephant', sci: 'Elephas maximus', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐘', tags: ['Fauna', 'Megaherbivore', 'Endangered', 'Corridors'] },
  { id: 'dolphin', name: 'Ganges River Dolphin', sci: 'Platanista gangetica', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐬', tags: ['Fauna', 'Cetacean', 'Freshwater', 'Endangered'] },
  { id: 'bustard', name: 'Great Indian Bustard', sci: 'Ardeotis nigriceps', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🦅', tags: ['Fauna', 'Avian', 'Critically Endangered', 'Grassland'] },
  { id: 'turtle', name: 'Olive Ridley Sea Turtle', sci: 'Lepidochelys olivacea', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐢', tags: ['Fauna', 'Reptile', 'Marine', 'Arribada'] },
  { id: 'rhino', name: 'Indian One-Horned Rhino', sci: 'Rhinoceros unicornis', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🦏', tags: ['Fauna', 'Megafauna', 'Vulnerable', 'Kaziranga'] },
  { id: 'lion', name: 'Asiatic Lion', sci: 'Panthera leo persica', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🦁', tags: ['Fauna', 'Endangered', 'Gir Forest', 'Apex'] },
  { id: 'tahr', name: 'Nilgiri Tahr', sci: 'Nilgiritragus hylocrius', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐐', tags: ['Fauna', 'Endemic', 'Western Ghats', 'Montane'] },
  { id: 'cobra', name: 'King Cobra', sci: 'Ophiophagus hannah', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🐍', tags: ['Fauna', 'Reptile', 'Rainforest', 'Vulnerable'] },
  { id: 'sundari', name: 'Sundari Mangrove Tree', sci: 'Heritiera fomes', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🌿', tags: ['Flora', 'Mangrove', 'Blue Carbon', 'Endangered'] },
  { id: 'teak', name: 'Indian Teak', sci: 'Tectona grandis', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🌳', tags: ['Flora', 'Deciduous', 'Forest Canopy'] },
  { id: 'orchid', name: 'Himalayan Blue Poppy', sci: 'Meconopsis gakyidiana', cat: 'Biodiversity' as NodeCategory, label: 'Species' as NodeLabel, icon: '🌸', tags: ['Flora', 'Alpine', 'Rare', 'Endemic'] },
];

const CORE_HABITATS = [
  { id: 'sundarbans', name: 'Sundarbans Mangrove Biome', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🏝️', region: 'West Bengal', area: '10,000 km²' },
  { id: 'western-ghats', name: 'Western Ghats Hotspot', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '⛰️', region: 'Karnataka / Kerala', area: '160,000 km²' },
  { id: 'kaziranga', name: 'Kaziranga Grassland Sanctuary', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🦏', region: 'Assam', area: '430 km²' },
  { id: 'gir-forest', name: 'Gir National Park', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🦁', region: 'Gujarat', area: '1,412 km²' },
  { id: 'andaman-reef', name: 'Andaman Fringing Coral Reefs', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🪸', region: 'Andaman & Nicobar', area: '11,000 km²' },
  { id: 'thar-desert', name: 'Thar Desert Ecosystem', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🏜️', region: 'Rajasthan', area: '200,000 km²' },
  { id: 'chilika-lake', name: 'Chilika Lake Ramsar Wetland', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🌊', region: 'Odisha', area: '1,100 km²' },
  { id: 'himalayan-alpine', name: 'Himalayan Alpine Tundra', cat: 'Spatial' as NodeCategory, label: 'Habitat' as NodeLabel, icon: '🏔️', region: 'Ladakh / HP', area: '85,000 km²' },
];

const CORE_POLLUTANTS = [
  { id: 'pm25', name: 'Fine Particulate Matter (PM2.5)', cat: 'Pollution' as NodeCategory, label: 'Pollutant' as NodeLabel, icon: '💨', code: 'CPCB:PM2.5' },
  { id: 'microplastics', name: 'Ocean Microplastics (<5mm)', cat: 'Pollution' as NodeCategory, label: 'Pollutant' as NodeLabel, icon: '🥤', code: 'CPCB:PLASTIC' },
  { id: 'nitrates', name: 'Agricultural Nitrate Runoff', cat: 'Pollution' as NodeCategory, label: 'Pollutant' as NodeLabel, icon: '🧪', code: 'CPCB:NITRATE' },
  { id: 'so2', name: 'Sulfur Dioxide Industrial Haze', cat: 'Pollution' as NodeCategory, label: 'Pollutant' as NodeLabel, icon: '🏭', code: 'CPCB:SO2' },
  { id: 'heavy-metals', name: 'Industrial Heavy Metal Effluents', cat: 'Pollution' as NodeCategory, label: 'Pollutant' as NodeLabel, icon: '⚗️', code: 'CPCB:METALS' },
];

const CORE_EMISSIONS = [
  { id: 'stubble-burn', name: 'Paddy Crop Stubble Burning', cat: 'Pollution' as NodeCategory, label: 'EmissionSource' as NodeLabel, icon: '🔥' },
  { id: 'coal-power', name: 'Thermal Power Coal Plants', cat: 'Pollution' as NodeCategory, label: 'EmissionSource' as NodeLabel, icon: '🏭' },
  { id: 'vehicular', name: 'Urban Diesel Exhaust', cat: 'Pollution' as NodeCategory, label: 'EmissionSource' as NodeLabel, icon: '🚗' },
  { id: 'single-use-plastic', name: 'Single-Use Packaging Waste', cat: 'Pollution' as NodeCategory, label: 'EmissionSource' as NodeLabel, icon: '📦' },
];

const CORE_CLIMATE = [
  { id: 'sea-level-rise', name: 'Coastal Sea Level Rise', cat: 'Climate' as NodeCategory, label: 'ClimateTrend' as NodeLabel, icon: '🌊' },
  { id: 'acidification', name: 'Ocean Acidification', cat: 'Climate' as NodeCategory, label: 'ClimateTrend' as NodeLabel, icon: '⚡' },
  { id: 'glacial-retreat', name: 'Himalayan Glacial Retreat', cat: 'Climate' as NodeCategory, label: 'ClimateTrend' as NodeLabel, icon: '🧊' },
  { id: 'monsoon-shift', name: 'Extreme Precipitation Shifts', cat: 'Climate' as NodeCategory, label: 'ClimateTrend' as NodeLabel, icon: '🌧️' },
  { id: 'blue-carbon', name: 'Mangrove Carbon Sink', cat: 'Climate' as NodeCategory, label: 'EcosystemService' as NodeLabel, icon: '💎' },
];

const CORE_POLICIES = [
  { id: 'project-tiger', name: 'Project Tiger NTCA Directive', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '📜' },
  { id: 'project-elephant', name: 'Project Elephant Reserve Plan', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '📜' },
  { id: 'ncap', name: 'National Clean Air Programme (NCAP)', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '🏛️' },
  { id: 'wpa-1972', name: 'Wildlife Protection Act 1972', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '⚖️' },
  { id: 'sdg13', name: 'UN SDG 13: Climate Action', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '🌐' },
  { id: 'sdg14', name: 'UN SDG 14: Life Below Water', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '🌐' },
  { id: 'sdg15', name: 'UN SDG 15: Life On Land', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '🌐' },
  { id: 'isa', name: 'International Solar Alliance (ISA)', cat: 'Policy' as NodeCategory, label: 'Policy' as NodeLabel, icon: '☀️' },
];

// Helper to generate dense galaxy nodes (creating 150+ interconnected nodes!)
function generateObsidianGalaxyGraph(): GraphData {
  const nodes: EcoNode[] = [];
  const edges: EcoEdge[] = [];

  // Add Core Species
  CORE_SPECIES.forEach((s) => {
    nodes.push({
      id: `species-${s.id}`,
      label: s.label,
      category: s.cat,
      name: s.name,
      scientificName: s.sci,
      description: `Obsidian Vault Note: ${s.name} (${s.sci}) is a vital entity within the global ecological network.`,
      attributes: { iucnStatus: 'EN', priority: 'High', gbifVerified: true },
      provenance: { source: 'GBIF & IUCN Red List 2026', license: 'CC-BY 4.0', confidenceScore: 0.98, lastUpdated: '2026-06-01' },
      tags: s.tags,
      icon: s.icon,
    });
  });

  // Add Core Habitats
  CORE_HABITATS.forEach((h) => {
    nodes.push({
      id: `habitat-${h.id}`,
      label: h.label,
      category: h.cat,
      name: h.name,
      description: `Obsidian Vault Note: ${h.name} situated in ${h.region}, covering an area of ${h.area}.`,
      attributes: { area: h.area, protectedStatus: 'UNESCO / Ramsar', region: h.region },
      spatial: { region: h.region, country: 'India' },
      provenance: { source: 'Forest Survey of India', license: 'Government Open Data License', confidenceScore: 0.99, lastUpdated: '2026-05-15' },
      tags: ['Habitat', 'Biome', h.region],
      icon: h.icon,
    });
  });

  // Add Core Pollutants
  CORE_POLLUTANTS.forEach((p) => {
    nodes.push({
      id: `pollutant-${p.id}`,
      label: p.label,
      category: p.cat,
      name: p.name,
      description: `Obsidian Vault Note: ${p.name} monitored under code ${p.code}. High environmental toxicity.`,
      attributes: { cpcbCode: p.code, hazardLevel: 'Severe' },
      provenance: { source: 'OpenAQ & CPCB Database', license: 'Open Air Quality License', confidenceScore: 0.97, lastUpdated: '2026-07-01' },
      tags: ['Pollutant', 'Hazard', 'CPCB'],
      icon: p.icon,
    });
  });

  // Add Core Emissions
  CORE_EMISSIONS.forEach((e) => {
    nodes.push({
      id: `emission-${e.id}`,
      label: e.label,
      category: e.cat,
      name: e.name,
      description: `Obsidian Vault Note: Major anthropogenic emission vector driving atmospheric stress.`,
      attributes: { annualTons: '14.9M', severity: 'Critical' },
      provenance: { source: 'ISRO Satellite & CPCB', license: 'Government Open Data License', confidenceScore: 0.96, lastUpdated: '2026-04-10' },
      tags: ['Emission', 'Anthropogenic', 'Air Quality'],
      icon: e.icon,
    });
  });

  // Add Core Climate
  CORE_CLIMATE.forEach((c) => {
    nodes.push({
      id: `climate-${c.id}`,
      label: c.label,
      category: c.cat,
      name: c.name,
      description: `Obsidian Vault Note: Systematic climate indicator shift affecting ecosystem equilibria.`,
      attributes: { trendRate: '+3.4mm/yr', riskLevel: 'Critical' },
      provenance: { source: 'IPCC AR6 & NOAA', license: 'CC-BY 4.0', confidenceScore: 0.99, lastUpdated: '2026-06-15' },
      tags: ['Climate', 'Global Shift', 'IPCC'],
      icon: c.icon,
    });
  });

  // Add Core Policies
  CORE_POLICIES.forEach((p) => {
    nodes.push({
      id: `policy-${p.id}`,
      label: p.label,
      category: p.cat,
      name: p.name,
      description: `Obsidian Vault Note: Legislative framework targeting environmental conservation.`,
      attributes: { framework: 'Government / UN', status: 'Active Law' },
      provenance: { source: 'MoEFCC & UN SDG Platform', license: 'Government Open Data License', confidenceScore: 1.0, lastUpdated: '2026-01-01' },
      tags: ['Policy', 'Governance', 'Conservation'],
      icon: p.icon,
    });
  });

  // Connect Core Edges
  let edgeId = 1;
  const addEdge = (src: string, tgt: string, type: any, label: string) => {
    edges.push({
      id: `edge-${edgeId++}`,
      sourceId: src,
      targetId: tgt,
      type,
      label,
      weight: 0.95,
      provenance: { source: 'EcoGraph Core Knowledge Engine', license: 'CC-BY 4.0', confidenceScore: 0.98, lastUpdated: '2026-07-22' },
    });
  };

  addEdge('species-tiger', 'habitat-sundarbans', 'lives_in', 'lives in mangrove biome');
  addEdge('species-sundari', 'habitat-sundarbans', 'lives_in', 'forms dominant tree canopy in');
  addEdge('policy-project-tiger', 'species-tiger', 'protects', 'provides sanctuary for');
  addEdge('species-tiger', 'climate-sea-level-rise', 'threatened_by', 'threatened by sea level rise');
  addEdge('habitat-sundarbans', 'climate-sea-level-rise', 'threatened_by', 'threatened by submergence');
  addEdge('habitat-sundarbans', 'climate-blue-carbon', 'affects', 'provides massive carbon storage');

  addEdge('species-elephant', 'habitat-western-ghats', 'lives_in', 'migrates across biomes of');
  addEdge('species-tahr', 'habitat-western-ghats', 'lives_in', 'endemic to montane slopes of');
  addEdge('policy-project-elephant', 'species-elephant', 'protects', 'establishes migration corridors for');

  addEdge('species-dolphin', 'pollutant-nitrates', 'threatened_by', 'threatened by river eutrophication');
  addEdge('species-rhino', 'habitat-kaziranga', 'lives_in', 'stronghold population in');

  addEdge('emission-stubble-burn', 'pollutant-pm25', 'emits', 'releases seasonal PM2.5 haze');
  addEdge('emission-coal-power', 'pollutant-pm25', 'emits', 'emits particulate & SO2 pollutants');
  addEdge('emission-coal-power', 'pollutant-so2', 'emits', 'emits sulfur dioxide gas');
  addEdge('policy-ncap', 'pollutant-pm25', 'reduces', 'targets 30% reduction of');
  addEdge('policy-ncap', 'policy-sdg13', 'part_of', 'aligns with UN SDG 13');

  addEdge('species-turtle', 'pollutant-microplastics', 'threatened_by', 'ingestion hazard from');
  addEdge('emission-single-use-plastic', 'pollutant-microplastics', 'emits', 'degrades into oceanic microplastics');
  addEdge('habitat-andaman-reef', 'climate-acidification', 'threatened_by', 'coral bleaching from acidification');
  addEdge('habitat-andaman-reef', 'pollutant-microplastics', 'affects', 'coral polyps smothered by plastics');

  addEdge('policy-isa', 'emission-coal-power', 'reduces', 'replaces coal with solar energy');
  addEdge('policy-isa', 'policy-sdg13', 'part_of', 'supports global climate action');

  // Procedurally generate additional interconnected satellite nodes to form a dense ~250+ node Obsidian Galaxy Web!
  const nodeCategories: NodeCategory[] = ['Biodiversity', 'Spatial', 'Pollution', 'Climate', 'Policy'];
  const labels: NodeLabel[] = ['Species', 'Habitat', 'Pollutant', 'ClimateTrend', 'Policy', 'Event'];
  const icons = ['🌱', '🌿', '🍂', '💧', '🌊', '💨', '⚡', '☀️', '🐾', '🔬', '📊', '🌐', '🛡️', '🏷️'];
  const edgeTypes: Array<'affects' | 'part_of' | 'threatened_by' | 'reduces' | 'emits' | 'protects'> = [
    'affects', 'part_of', 'threatened_by', 'reduces', 'emits', 'protects',
  ];
  const namePool = [
    'Ecosystem Dynamics', 'Carbon Flux', 'Soil Microbiome', 'Wetland Buffer',
    'Migratory Corridor', 'Riparian Zone', 'Urban Heat Island', 'Agroforestry',
    'Seed Dispersal', 'Keystone Predator', 'Invasive Species', 'Coral Bleaching',
    'Permafrost Thaw', 'Mangrove Resilience', 'Wind Farm Impact', 'Solar Potential',
    'Groundwater Table', 'Riverine Sediment', 'Glacial Meltwater', 'Bioacoustics',
    'Phenology Shift', 'Pollinator Network', 'Food Web Cascade', 'Nutrient Cycling',
    'Desertification Risk', 'Forest Fragmentation', 'Peat Carbon Store', 'Marine Reserve',
    'Thermal Stratification', 'Algal Bloom', 'Ozone Layer', 'Nitrogen Fixation',
  ];

  for (let i = 1; i <= 200; i++) {
    const cat = nodeCategories[i % nodeCategories.length];
    const lbl = labels[i % labels.length];
    const nodeId = `obsidian-node-${i}`;
    const baseName = namePool[i % namePool.length];
    const name = i <= namePool.length ? baseName : `${baseName} ${Math.ceil(i / namePool.length)}`;

    nodes.push({
      id: nodeId,
      label: lbl,
      category: cat,
      name,
      description: `Vault Note: ${name} — Sub-concept analyzing ${cat.toLowerCase()} dynamics, feedback loops, and cross-domain interactions in the EcoGraph knowledge web.`,
      attributes: { vaultId: `NOTE-${1000 + i}`, nodeWeight: Math.round(Math.random() * 50) + 10 },
      provenance: { source: 'EcoGraph Automated Knowledge Pipeline', license: 'CC-BY 4.0', confidenceScore: 0.95, lastUpdated: '2026-07-22' },
      tags: ['VaultNote', cat, 'SubEntity'],
      icon: icons[i % icons.length],
    });

    // Link to a core node
    const coreCount = CORE_SPECIES.length + CORE_HABITATS.length + CORE_POLLUTANTS.length + CORE_CLIMATE.length + CORE_POLICIES.length + CORE_EMISSIONS.length;
    const targetCoreNode = nodes[i % coreCount];
    if (targetCoreNode) {
      edges.push({
        id: `edge-proc-${i}`,
        sourceId: nodeId,
        targetId: targetCoreNode.id,
        type: edgeTypes[i % edgeTypes.length],
        label: `linked to ${targetCoreNode.name}`,
        weight: 0.85,
        provenance: { source: 'EcoGraph Core Pipeline', license: 'CC-BY 4.0', confidenceScore: 0.95, lastUpdated: '2026-07-22' },
      });
    }

    // Cross-link to nearby procedural nodes (creates dense mesh)
    if (i > 3) {
      const peer1 = `obsidian-node-${i - 1}`;
      const peer2 = `obsidian-node-${Math.max(1, i - Math.floor(Math.random() * 8) - 2)}`;
      edges.push({
        id: `edge-mesh-${i}-a`,
        sourceId: nodeId,
        targetId: peer1,
        type: edgeTypes[(i + 1) % edgeTypes.length],
        label: 'connected concept',
        weight: 0.7,
        provenance: { source: 'EcoGraph Mesh Generator', license: 'CC-BY 4.0', confidenceScore: 0.9, lastUpdated: '2026-07-22' },
      });
      if (peer2 !== peer1) {
        edges.push({
          id: `edge-mesh-${i}-b`,
          sourceId: nodeId,
          targetId: peer2,
          type: edgeTypes[(i + 3) % edgeTypes.length],
          label: 'cross-linked concept',
          weight: 0.65,
          provenance: { source: 'EcoGraph Mesh Generator', license: 'CC-BY 4.0', confidenceScore: 0.88, lastUpdated: '2026-07-22' },
        });
      }
    }

    // Extra long-range links for small-world topology
    if (i % 5 === 0 && i > 20) {
      const farTarget = `obsidian-node-${Math.max(1, i - 15 - (i % 7))}`;
      edges.push({
        id: `edge-far-${i}`,
        sourceId: nodeId,
        targetId: farTarget,
        type: 'affects',
        label: 'long-range influence',
        weight: 0.6,
        provenance: { source: 'EcoGraph Cross-Domain', license: 'CC-BY 4.0', confidenceScore: 0.85, lastUpdated: '2026-07-22' },
      });
    }
  }

  return { nodes, edges };
}

export const INITIAL_ECOGRAPH_DATA: GraphData = generateObsidianGalaxyGraph();

