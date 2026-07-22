export interface OntologyTerm {
  code: string;
  name: string;
  ontology: string;
  description: string;
  uri: string;
}

export const ENVO_HABITAT_ONTOLOGY: Record<string, OntologyTerm> = {
  'ENVO:01000021': {
    code: 'ENVO:01000021',
    name: 'Mangrove Forest Biome',
    ontology: 'ENVO',
    description: 'A coastal marine ecosystem dominated by mangrove trees in saline intertidal zones.',
    uri: 'http://purl.obolibrary.org/obo/ENVO_01000021',
  },
  'ENVO:00000109': {
    code: 'ENVO:00000109',
    name: 'Montane Tropical Forest',
    ontology: 'ENVO',
    description: 'High-elevation tropical forest biome featuring dense canopy and rich endemic biodiversity.',
    uri: 'http://purl.obolibrary.org/obo/ENVO_00000109',
  },
  'ENVO:00000012': {
    code: 'ENVO:00000012',
    name: 'Freshwater Wetland',
    ontology: 'ENVO',
    description: 'Inland aquatic environment dominated by non-tidal marshes, swamps, and river floodplains.',
    uri: 'http://purl.obolibrary.org/obo/ENVO_00000012',
  },
  'ENVO:00000224': {
    code: 'ENVO:00000224',
    name: 'Coral Reef Marine Ecosystem',
    ontology: 'ENVO',
    description: 'Submerged ocean structure built by reef-building polyps, supporting high biodiversity.',
    uri: 'http://purl.obolibrary.org/obo/ENVO_00000224',
  },
};

export const IUCN_RED_LIST_STATUS: Record<string, { code: string; label: string; color: string }> = {
  EX: { code: 'EX', label: 'Extinct', color: '#000000' },
  EW: { code: 'EW', label: 'Extinct in the Wild', color: '#3d0007' },
  CR: { code: 'CR', label: 'Critically Endangered', color: '#d90429' },
  EN: { code: 'EN', label: 'Endangered', color: '#f77f00' },
  VU: { code: 'VU', label: 'Vulnerable', color: '#fcbf49' },
  NT: { code: 'NT', label: 'Near Threatened', color: '#aacc00' },
  LC: { code: 'LC', label: 'Least Concern', color: '#2b9348' },
  DD: { code: 'DD', label: 'Data Deficient', color: '#6c757d' },
};

export const CPCB_POLLUTANT_CODES: Record<string, OntologyTerm> = {
  'CPCB:PM2.5': {
    code: 'CPCB:PM2.5',
    name: 'Fine Particulate Matter (PM2.5)',
    ontology: 'CPCB/EPA',
    description: 'Inhalable particles with diameters 2.5 micrometers or smaller causing severe respiratory and cardiovascular stress.',
    uri: 'https://cpcb.nic.in/air-quality-standards/',
  },
  'CPCB:NO2': {
    code: 'CPCB:NO2',
    name: 'Nitrogen Dioxide',
    ontology: 'CPCB/EPA',
    description: 'Gaseous air pollutant generated primary by fossil fuel combustion and industrial emissions.',
    uri: 'https://cpcb.nic.in/air-quality-standards/',
  },
  'CPCB:PLASTIC': {
    code: 'CPCB:PLASTIC',
    name: 'Non-Biodegradable Microplastics',
    ontology: 'CPCB/UNEP',
    description: 'Polymer debris polluting aquatic biomes and entering ecological food webs.',
    uri: 'https://cpcb.nic.in/waste-management/',
  },
};

export const BIOLINK_RELATIONS: Record<string, { label: string; biolinkUri: string; description: string }> = {
  lives_in: {
    label: 'lives in',
    biolinkUri: 'biolink:occurs_in',
    description: 'Specifies the natural habitat or spatial biome where an organism naturally occurs.',
  },
  threatened_by: {
    label: 'threatened by',
    biolinkUri: 'biolink:affected_by',
    description: 'Connects an organism or habitat to an environmental stressor or pollution source.',
  },
  affects: {
    label: 'affects',
    biolinkUri: 'biolink:acts_on',
    description: 'Describes the causal impact of a pollutant, climate shift, or event on an ecosystem.',
  },
  reduces: {
    label: 'reduces impact of',
    biolinkUri: 'biolink:negatively_regulates',
    description: 'Indicates a conservation policy or mitigation action decreasing environmental stress.',
  },
  protects: {
    label: 'protects',
    biolinkUri: 'biolink:prevents',
    description: 'Links legal frameworks or conservation measures to target species or sanctuaries.',
  },
};
