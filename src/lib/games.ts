import { Building2, Anchor, Mountain, Trees, Recycle, Map as MapIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Game {
  id: string;
  title: string;
  description: string;
  video: string;
  imageHint: string;
  tags: string[];
  icon: LucideIcon;
  gameLink: string;
  htmlPath?: string; // Path to the standalone HTML game
}

export const games: Game[] = [
  {
    id: 'eco-city-builder',
    title: 'Eco City Builder',
    description:
      'As mayor, design and build a sustainable city from the ground up. Balance growth with green choices in energy, transport, and waste management.',
    video: '/videos/games/eco-city-builder.mp4',
    imageHint: 'future city',
    tags: ['urban planning', 'sustainability', 'systems thinking'],
    icon: Building2,
    gameLink: '/play/eco-city-builder',
  },
  {
    id: 'ocean-explorer',
    title: 'Reef Rescue',
    description:
      'Dive into a coral reef ecosystem. Clean up pollution, repair damaged coral, and learn about the delicate balance of marine life in this underwater mission.',
    video: '/videos/games/ocean-explorer.mp4',
    imageHint: 'coral reef',
    tags: ['marine biology', 'pollution', 'oceans'],
    icon: Anchor,
    gameLink: '/play/ocean-explorer',
    htmlPath: '/games/reef-rescue.html'
  },
  {
    id: 'carbon-quest',
    title: 'Carbon Crunch',
    description:
      'Take on the industrial city skyline. Tackle climate change by managing emissions, public approval, and CO₂ levels through strategic green swaps.',
    video: '/videos/games/carbon-quest.mp4',
    imageHint: 'arctic ice',
    tags: ['climate change', 'policy', 'strategy'],
    icon: Mountain,
    gameLink: '/play/carbon-quest',
    htmlPath: '/games/carbon-crunch.html'
  },
  {
    id: 'forest-guardian',
    title: 'Forest Defender',
    description:
      'Become a canopy guardian. Restore a thriving forest by planting native trees, rescuing animals, and protecting the ecosystem from deforestation.',
    video: '/videos/games/forest-guardian.mp4',
    imageHint: 'lush forest',
    tags: ['conservation', 'ecology', 'biodiversity'],
    icon: Trees,
    gameLink: '/play/forest-guardian',
    htmlPath: '/games/forest-defender.html'
  },
  {
    id: 'recycle-rally',
    title: 'Waste Wizard',
    description:
      'A fast-paced retro sorting challenge. Learn the ins and outs of recycling, composting, and waste reduction to become the ultimate waste wizard.',
    video: '/videos/games/recycle-rally.mp4',
    imageHint: 'recycling plant',
    tags: ['waste management', 'recycling', 'civic responsibility'],
    icon: Recycle,
    gameLink: '/play/recycle-rally',
    htmlPath: '/games/waste-wizard.html'
  },
  {
    id: 'migration-map',
    title: 'Migration Map',
    description:
      'Global map puzzle challenge. Help endangered species navigate climate-driven habitat loss and reach safety in this strategic world map game.',
    video: '/videos/games/carbon-quest.mp4', // Placeholder video
    imageHint: 'world map',
    tags: ['climate change', 'migration', 'habitats'],
    icon: MapIcon,
    gameLink: '/play/migration-map',
    htmlPath: '/games/migration-map.html'
  },
];
