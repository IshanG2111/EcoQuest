import { Building2, Anchor, Mountain, Trees, Recycle } from 'lucide-react';
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
    title: 'Ocean Explorer',
    description:
      'Dive into a coral reef ecosystem as an oceanographer. Clean up pollution, repair damaged coral, and learn about the delicate balance of marine life.',
    video: '/videos/games/ocean-explorer.mp4',
    imageHint: 'coral reef',
    tags: ['marine biology', 'pollution', 'oceans'],
    icon: Anchor,
    gameLink: '/play/ocean-explorer',
  },
  {
    id: 'carbon-quest',
    title: 'Carbon Quest',
    description:
      'Take on the role of a policymaker to tackle climate change and manage carbon emissions by balancing the budget, public approval, and CO₂ levels.',
    video: '/videos/games/carbon-quest.mp4',
    imageHint: 'arctic ice',
    tags: ['climate change', 'policy', 'strategy'],
    icon: Mountain,
    gameLink: '/play/carbon-quest',
  },
  {
    id: 'forest-guardian',
    title: 'Forest Guardian',
    description:
      'Become a virtual park ranger. Restore a thriving forest by planting native trees, rescuing endangered animals, and protecting the ecosystem from threats.',
    video: '/videos/games/forest-guardian.mp4',
    imageHint: 'lush forest',
    tags: ['conservation', 'ecology', 'biodiversity'],
    icon: Trees,
    gameLink: '/play/forest-guardian',
  },
  {
    id: 'recycle-rally',
    title: 'Recycle Rally',
    description:
      'Race against time in a fast-paced challenge to sort waste correctly. Learn the ins and outs of recycling, composting, and waste reduction.',
    video: '/videos/games/recycle-rally.mp4',
    imageHint: 'recycling plant',
    tags: ['waste management', 'recycling', 'civic responsibility'],
    icon: Recycle,
    gameLink: '/play/recycle-rally',
  },
];
